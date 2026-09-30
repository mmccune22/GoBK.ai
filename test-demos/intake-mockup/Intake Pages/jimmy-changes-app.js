(function(){
  // Isolated public test: no shared reads, writes, timers, or queued-message flushes.
  if (window.__MATT_ISOLATED_TEST__) return;
  var meta = window.JIMMY_CHANGE_META || {};
  var items = Array.isArray(window.JIMMY_CHANGE_ITEMS) ? window.JIMMY_CHANGE_ITEMS : [];
  var apiUrl = meta.reviewApiUrl || "";
  var actorStorageKey = "mcl_jimmy_changes_actor_v1";
  var outboxStorageKey = "mcl_changelog_outbox_v1";
  var textStorageKey = "mcl_jimmy_changes_text_edits_v1";
  var actor = reviewerFromUrl() || readString(actorStorageKey) || "Jimmy";
  var outbox = readArray(outboxStorageKey);
  var textEdits = readJson(textStorageKey);
  var sharedState = { items: {}, revision: 0, updatedAt: null };
  var syncMode = "loading";
  var syncError = "";
  var flushing = false;
  var showDismissed = false;
  var refreshTimer;
  var list = document.getElementById("changeList");
  var syncStatus = document.getElementById("syncStatus");
  var syncDetail = document.getElementById("syncDetail");
  var toast = document.getElementById("toast");

  document.getElementById("branchName").textContent = meta.branch || "Jimmy branch";
  document.getElementById("updatedOn").textContent = meta.updated ? "Updated " + meta.updated : "Updated from changelog data";
  localStorage.setItem(actorStorageKey, actor);

  document.querySelectorAll("[data-reviewer]").forEach(function(button){
    button.addEventListener("click", function(){
      setActor(button.getAttribute("data-reviewer"));
    });
  });

  list.addEventListener("click", function(event){
    var resetButton = event.target.closest("[data-reset-writing]");
    var dismissedVisibilityButton = event.target.closest("[data-toggle-dismissed]");
    var actionButton = event.target.closest("[data-checklist-action]");
    if (dismissedVisibilityButton) {
      showDismissed = !showDismissed;
      render();
      return;
    }
    if (resetButton) {
      resetItemWriting(resetButton.getAttribute("data-reset-writing"));
      return;
    }
    if (!actionButton) return;
    if (!actor) {
      showToast("Choose Matt or Jimmy first.");
      return;
    }
    var action = actionButton.getAttribute("data-checklist-action");
    var id = actionButton.getAttribute("data-change-id");
    var item = findItem(id);
    if (!item) return;
    var state = effectiveItemState(id);
    if (action === "approval-needed" && actor !== "Jimmy") {
      showToast("Switch to Jimmy to elevate a change.");
      return;
    }
    if (action === "implemented" && actor !== "Jimmy") {
      showToast("Switch to Jimmy to update implementation status.");
      return;
    }
    if (action === "approved" && actor !== "Matt") {
      showToast("Switch to Matt to record approval.");
      return;
    }
    if (action === "undo-requested" && actor !== "Matt") {
      showToast("Switch to Matt to request an undo.");
      return;
    }
    var active;
    if (action === "implemented") active = !Boolean(state.implemented && state.implemented.active);
    else if (action === "approval-needed") active = !Boolean(state.approvalNeeded && state.approvalNeeded.active);
    else if (action === "approved") active = !Boolean(state.approved && state.approved.active);
    else if (action === "dismissed") active = !Boolean(state.dismissed && state.dismissed.active);
    else if (action === "undo-requested") active = !Boolean(state.undoRequested && state.undoRequested.active);
    else return;
    if (action === "approval-needed" && active && state.approved && state.approved.active) {
      queueAction(item, "approved", false, true);
    }
    queueAction(item, action, active);
  });

  list.addEventListener("input", function(event){
    var editable = event.target.closest("[data-edit-change]");
    if (!editable) return;
    setTextEdit(
      editable.getAttribute("data-edit-change"),
      editable.getAttribute("data-edit-field"),
      editable.textContent
    );
  });

  list.addEventListener("keydown", function(event){
    var editable = event.target.closest("[data-edit-change]");
    if (!editable || event.key !== "Enter") return;
    event.preventDefault();
    editable.blur();
  });

  list.addEventListener("focusout", function(event){
    if (!event.target.closest("[data-edit-change]")) return;
    render();
  });

  list.addEventListener("paste", function(event){
    var editable = event.target.closest("[data-edit-change]");
    if (!editable) return;
    event.preventDefault();
    var text = (event.clipboardData || window.clipboardData).getData("text/plain").replace(/\s+/g, " ");
    document.execCommand("insertText", false, text);
  });

  window.addEventListener("online", function(){
    syncError = "";
    flushOutbox();
    refreshSharedState();
  });

  document.addEventListener("visibilitychange", function(){
    if (document.visibilityState === "visible") refreshSharedState();
  });

  render();
  refreshSharedState().finally(function(){ flushOutbox(); });
  refreshTimer = window.setInterval(function(){
    if (document.visibilityState === "visible") refreshSharedState();
  }, 30000);
  window.addEventListener("beforeunload", function(){ window.clearInterval(refreshTimer); });

  function setActor(nextActor){
    if (nextActor !== "Matt" && nextActor !== "Jimmy") return;
    actor = nextActor;
    localStorage.setItem(actorStorageKey, actor);
    render();
    flushOutbox();
  }

  function queueAction(item, action, active, deferFlush){
    outbox.push({
      eventId: createEventId(),
      featureId: item.id,
      featureTitle: getItemText(item, "title"),
      actor: actor,
      action: action,
      active: Boolean(active),
      queuedAt: new Date().toISOString()
    });
    saveOutbox();
    render();
    if (!deferFlush) flushOutbox();
  }

  async function flushOutbox(){
    if (flushing || !outbox.length || !apiUrl) return;
    flushing = true;
    syncMode = "saving";
    syncError = "";
    renderSyncStatus();
    try {
      while (outbox.length) {
        var response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outbox[0]),
          cache: "no-store"
        });
        var body = await response.json().catch(function(){ return {}; });
        if (!response.ok || !body.ok) throw new Error(body.error || "Shared save failed.");
        acceptSharedState(body);
        outbox.shift();
        saveOutbox();
        render();
      }
      syncMode = "ready";
    } catch (error) {
      syncMode = "offline";
      syncError = error && error.message ? error.message : "Shared save is unavailable.";
    } finally {
      flushing = false;
      render();
    }
  }

  async function refreshSharedState(){
    if (!apiUrl || flushing) return;
    if (!outbox.length) syncMode = "loading";
    renderSyncStatus();
    try {
      var response = await fetch(apiUrl, { cache: "no-store" });
      var body = await response.json().catch(function(){ return {}; });
      if (!response.ok || !body.ok) throw new Error(body.error || "Shared changelog failed to load.");
      acceptSharedState(body);
      syncMode = outbox.length ? "saving" : "ready";
      syncError = "";
    } catch (error) {
      syncMode = "offline";
      syncError = error && error.message ? error.message : "Shared changelog is unavailable.";
    }
    render();
  }

  function newestFirst(sourceItems){
    return sourceItems.map(function(item, index){
      return { item: item, index: index, time: Date.parse(item.date || "") };
    }).sort(function(a, b){
      if (Number.isFinite(a.time) && Number.isFinite(b.time) && a.time !== b.time) return b.time - a.time;
      return b.index - a.index;
    }).map(function(entry){
      return entry.item;
    });
  }

  function render(){
    renderActorPicker();
    renderSyncStatus();

    if (!items.length) {
      list.innerHTML = '<div class="empty">No significant changes are logged yet.</div>';
      return;
    }

    var orderedItems = newestFirst(items);
    var dismissedCount = orderedItems.filter(function(item){
      var state = effectiveItemState(item.id);
      return Boolean(state.dismissed && state.dismissed.active);
    }).length;
    var visibleItems = showDismissed ? orderedItems : orderedItems.filter(function(item){
      var state = effectiveItemState(item.id);
      return !Boolean(state.dismissed && state.dismissed.active);
    });
    var dismissedToolbar = dismissedCount ? '<div class="change-toolbar"><button type="button" class="secondary" data-toggle-dismissed aria-pressed="' + String(showDismissed) + '">' + (showDismissed ? 'Hide dismissed' : 'Show dismissed (' + dismissedCount + ')') + '</button></div>' : '';
    var renderedItems = visibleItems.map(function(item){
      var state = effectiveItemState(item.id);
      var isImplemented = Boolean(state.implemented && state.implemented.active);
      var approvalNeeded = Boolean(state.approvalNeeded && state.approvalNeeded.active);
      var isApproved = Boolean(approvalNeeded && state.approved && state.approved.active);
      var isDismissed = Boolean(state.dismissed && state.dismissed.active);
      var isUndoRequested = Boolean(state.undoRequested && state.undoRequested.active);
      var isOutstanding = approvalNeeded && !isApproved;
      var edited = Boolean(textEdits[item.id]);
      var pending = outbox.some(function(entry){ return entry.featureId === item.id; });
      var cardClass = "change-item" + (isOutstanding ? " needs-approval" : "") + (isApproved ? " approved" : "") + (isImplemented ? " implemented" : "") + (isDismissed ? " dismissed" : "") + (isUndoRequested ? " undo-requested" : "");
      return '<article class="' + cardClass + '">' +
        '<div class="change-main">' +
          '<div class="tags">' +
            (item.date ? '<time class="tag" datetime="' + escapeAttribute(item.date) + '">' + escapeHtml(formatEntryDate(item.date)) + '</time>' : '') +
            '<span class="tag">' + escapeHtml(item.category || "Change") + '</span>' +
            '<span class="tag status">' + escapeHtml(item.status || "Listed") + '</span>' +
            '<span class="tag commit">' + escapeHtml(item.commit || "branch") + '</span>' +
            (pending ? '<span class="tag pending">Saving</span>' : '') +
          '</div>' +
          editableText(item, "title", "h3", "change-title") +
          editableText(item, "summary", "p", "change-summary") +
          editableText(item, "mattDecision", "p", "decision") +
          renderPages(item.pages) +
          renderLinks(item.links) +
        '</div>' +
        '<div class="pick-control">' +
          '<button type="button" class="implemented' + (isImplemented ? ' active' : '') + '" data-checklist-action="implemented" data-change-id="' + escapeAttribute(item.id) + '" aria-pressed="' + String(isImplemented) + '" title="Record that Jimmy implemented this feature"' + disableAttribute(pending || actor !== "Jimmy") + '>Implemented</button>' +
          '<button type="button" class="undo-requested' + (isUndoRequested ? ' active' : '') + '" data-checklist-action="undo-requested" data-change-id="' + escapeAttribute(item.id) + '" aria-pressed="' + String(isUndoRequested) + '" title="' + (isUndoRequested ? 'Clear Matt\'s undo request' : 'Notify Jimmy that Matt wants this change undone') + '"' + disableAttribute(pending || actor !== "Matt") + '>' + (isUndoRequested ? 'Undo requested' : 'Request undo') + '</button>' +
          '<button type="button" class="approval-needed' + (approvalNeeded ? ' active' : '') + '" data-checklist-action="approval-needed" data-change-id="' + escapeAttribute(item.id) + '" aria-pressed="' + String(approvalNeeded) + '" title="Elevate this change for Matt approval"' + disableAttribute(pending || actor !== "Jimmy") + '>Approval needed</button>' +
          '<button type="button" class="approved' + (isApproved ? ' active' : '') + '" data-checklist-action="approved" data-change-id="' + escapeAttribute(item.id) + '" aria-pressed="' + String(isApproved) + '" title="Record Matt approval"' + disableAttribute(pending || actor !== "Matt" || !approvalNeeded) + '>Approved</button>' +
          '<div class="state-details">' + renderStateDetails(state) + '</div>' +
          '<button type="button" class="ghost dismissed-toggle" data-checklist-action="dismissed" data-change-id="' + escapeAttribute(item.id) + '" aria-pressed="' + String(isDismissed) + '" title="' + (isDismissed ? 'Restore this change for both reviewers' : 'Dismiss this change for both reviewers') + '"' + disableAttribute(pending) + '>' + (isDismissed ? 'Restore' : 'Dismiss') + '</button>' +
          (edited ? '<button type="button" class="ghost reset-copy" data-reset-writing="' + escapeAttribute(item.id) + '">Reset writing</button>' : '') +
        '</div>' +
      '</article>';
    }).join("");
    list.innerHTML = dismissedToolbar + (renderedItems || '<div class="empty">All logged changes are dismissed. Use Show dismissed to restore one.</div>');
  }

  function acceptSharedState(nextState){
    var currentTime = sharedState.updatedAt ? new Date(sharedState.updatedAt).getTime() : 0;
    var nextTime = nextState.updatedAt ? new Date(nextState.updatedAt).getTime() : 0;
    if (!currentTime || (nextTime && nextTime >= currentTime)) sharedState = nextState;
  }

  function renderActorPicker(){
    document.querySelectorAll("[data-reviewer]").forEach(function(button){
      var selected = button.getAttribute("data-reviewer") === actor;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function renderSyncStatus(){
    syncStatus.className = "sync-status";
    if (!actor) {
      syncStatus.textContent = "Choose Matt or Jimmy";
      syncStatus.classList.add("warning");
      syncDetail.textContent = "Approval status is shared after a reviewer is chosen.";
      return;
    }
    if (syncMode === "offline") {
      syncStatus.textContent = outbox.length ? "Queued on this browser" : "Shared board unavailable";
      syncStatus.classList.add("error");
      syncDetail.textContent = syncError || "Changes will retry automatically.";
      return;
    }
    if (flushing || outbox.length) {
      syncStatus.textContent = "Saving shared changes";
      syncStatus.classList.add("warning");
      syncDetail.textContent = outbox.length + " action" + (outbox.length === 1 ? "" : "s") + " waiting.";
      return;
    }
    if (syncMode === "loading") {
      syncStatus.textContent = "Loading shared changelog";
      syncStatus.classList.add("warning");
      syncDetail.textContent = "Checking for Matt and Jimmy updates.";
      return;
    }
    syncStatus.textContent = "Shared and saved";
    syncDetail.textContent = sharedState.updatedAt ? "Last update " + formatDate(sharedState.updatedAt) + "." : "No approval activity yet.";
  }

  function effectiveItemState(id){
    var source = sharedState.items && sharedState.items[id] ? sharedState.items[id] : {};
    var state = {
      implemented: source.implemented ? copyState(source.implemented) : null,
      approvalNeeded: source.approvalNeeded ? copyState(source.approvalNeeded) : null,
      approved: source.approved ? copyState(source.approved) : null,
      dismissed: source.dismissed ? copyState(source.dismissed) : null,
      undoRequested: source.undoRequested ? copyState(source.undoRequested) : null
    };
    outbox.forEach(function(entry){
      if (entry.featureId !== id) return;
      var next = { active: entry.active, actor: entry.actor, at: entry.queuedAt, pending: true };
      if (entry.action === "implemented") state.implemented = next;
      if (entry.action === "approval-needed") state.approvalNeeded = next;
      if (entry.action === "approved") state.approved = next;
      if (entry.action === "dismissed") state.dismissed = next;
      if (entry.action === "undo-requested") state.undoRequested = next;
    });
    return state;
  }

  function copyState(value){
    return { active: Boolean(value.active), actor: value.actor, at: value.at, eventId: value.eventId };
  }

  function renderStateDetails(state){
    var lines = [];
    if (state.implemented && state.implemented.active) {
      lines.push('<span class="state-line complete"><strong>Implemented:</strong> ' + escapeHtml(state.implemented.actor) + " " + escapeHtml(formatDate(state.implemented.at)) + '</span>');
    } else {
      lines.push('<span class="state-line">Not marked implemented.</span>');
    }
    if (state.approvalNeeded && state.approvalNeeded.active) {
      lines.push('<span class="state-line"><strong>Approval requested:</strong> ' + escapeHtml(state.approvalNeeded.actor) + " " + escapeHtml(formatDate(state.approvalNeeded.at)) + '</span>');
    } else {
      lines.push('<span class="state-line">Logged with no approval required.</span>');
    }
    if (state.approvalNeeded && state.approvalNeeded.active) {
      if (state.approved && state.approved.active) {
        lines.push('<span class="state-line complete"><strong>Approved:</strong> ' + escapeHtml(state.approved.actor) + " " + escapeHtml(formatDate(state.approved.at)) + '</span>');
      } else {
        lines.push('<span class="state-line pending-approval">Awaiting Matt approval.</span>');
      }
    }
    if (state.dismissed && state.dismissed.active) {
      lines.push('<span class="state-line"><strong>Dismissed:</strong> ' + escapeHtml(state.dismissed.actor) + " " + escapeHtml(formatDate(state.dismissed.at)) + '</span>');
    }
    if (state.undoRequested && state.undoRequested.active) {
      lines.push('<span class="state-line undo"><strong>Undo requested:</strong> ' + escapeHtml(state.undoRequested.actor) + " " + escapeHtml(formatDate(state.undoRequested.at)) + '</span>');
    }
    return lines.join("");
  }

  function editableText(item, field, tagName, className){
    return '<' + tagName + ' class="' + className + ' editable-copy" contenteditable="true" spellcheck="true" data-edit-change="' + escapeAttribute(item.id) + '" data-edit-field="' + escapeAttribute(field) + '" aria-label="Edit ' + escapeAttribute(field) + ' for ' + escapeAttribute(getItemText(item, "title")) + '">' + escapeHtml(getItemText(item, field)) + '</' + tagName + '>';
  }

  function renderPages(pages){
    if (!Array.isArray(pages) || !pages.length) return "";
    return '<ul class="page-list">' + pages.map(function(page){ return '<li>' + escapeHtml(page) + '</li>'; }).join("") + '</ul>';
  }

  function renderLinks(links){
    if (!Array.isArray(links) || !links.length) return "";
    return '<div class="card-links">' + links.map(function(link){ return '<a href="' + escapeAttribute(link.href) + '">' + escapeHtml(link.label) + '</a>'; }).join("") + '</div>';
  }

  function findItem(id){
    return items.find(function(item){ return item.id === id; });
  }

  function getItemText(item, field){
    var itemEdits = textEdits[item.id] || {};
    return Object.prototype.hasOwnProperty.call(itemEdits, field) ? itemEdits[field] : (item[field] || "");
  }

  function setTextEdit(id, field, value){
    var item = findItem(id);
    if (!item || !field) return;
    var original = item[field] || "";
    if (!textEdits[id]) textEdits[id] = {};
    if (value === original) delete textEdits[id][field];
    else textEdits[id][field] = value;
    if (!Object.keys(textEdits[id]).length) delete textEdits[id];
    localStorage.setItem(textStorageKey, JSON.stringify(textEdits));
  }

  function resetItemWriting(id){
    if (!textEdits[id]) return;
    delete textEdits[id];
    localStorage.setItem(textStorageKey, JSON.stringify(textEdits));
    render();
    showToast("Writing reset for that change.");
  }

  function saveOutbox(){ localStorage.setItem(outboxStorageKey, JSON.stringify(outbox)); }

  function readJson(key){
    try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; }
    catch (error) { return {}; }
  }

  function readArray(key){
    try {
      var value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) { return []; }
  }

  function readString(key){
    var value = localStorage.getItem(key) || "";
    return value === "Matt" || value === "Jimmy" ? value : "";
  }

  function reviewerFromUrl(){
    var value = new URLSearchParams(window.location.search).get("reviewer") || "";
    return value === "Matt" || value === "Jimmy" ? value : "";
  }

  function createEventId(){
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "event-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function formatDate(value){
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  function formatEntryDate(value){
    if (!value) return "";
    var date = new Date(value + "T12:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  }

  function disableAttribute(disabled){ return disabled ? ' disabled aria-disabled="true"' : ""; }

  function showToast(message){
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function(){ toast.classList.remove("show"); }, 2400);
  }

  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value){ return escapeHtml(value || "#"); }
})();
