(function(){
  // Isolated public test: no shared reads, writes, timers, or queued-message flushes.
  if (window.__MATT_ISOLATED_TEST__) return;
  var meta = window.JIMMY_CHANGE_META || {};
  var apiUrl = meta.reviewRequestsApiUrl || "";
  var actorStorageKey = "mcl_jimmy_changes_actor_v1";
  var outboxStorageKey = "mcl_feature_requests_outbox_v1";
  var requests = [];
  var outbox = readArray(outboxStorageKey);
  var loading = false;
  var flushing = false;
  var loadError = "";
  var refreshTimer;

  var form = document.getElementById("requestForm");
  var titleInput = document.getElementById("requestTitle");
  var detailsInput = document.getElementById("requestDetails");
  var submitButton = document.getElementById("submitRequest");
  var list = document.getElementById("requestList");
  var status = document.getElementById("requestStatus");

  if (!form || !titleInput || !detailsInput || !submitButton || !list || !status) return;

  form.addEventListener("submit", function(event){
    event.preventDefault();
    queueCreate();
  });

  titleInput.addEventListener("input", updateForm);
  detailsInput.addEventListener("input", updateForm);

  list.addEventListener("click", function(event){
    var button = event.target.closest("[data-request-implemented]");
    if (!button || readActor() !== "Jimmy") return;
    var request = findRequest(button.getAttribute("data-request-implemented"));
    if (!request || request.pending) return;
    queueImplemented(request, !(request.implemented && request.implemented.active));
  });

  document.querySelectorAll("[data-reviewer]").forEach(function(button){
    button.addEventListener("click", function(){
      window.setTimeout(render, 0);
    });
  });

  window.addEventListener("online", function(){
    loadError = "";
    flushOutbox();
    refreshRequests();
  });

  document.addEventListener("visibilitychange", function(){
    if (document.visibilityState === "visible") refreshRequests();
  });

  render();
  refreshRequests().finally(function(){ flushOutbox(); });
  refreshTimer = window.setInterval(function(){
    if (document.visibilityState === "visible") refreshRequests();
  }, 30000);
  window.addEventListener("beforeunload", function(){ window.clearInterval(refreshTimer); });

  function queueCreate(){
    var actor = readActor();
    var title = titleInput.value.trim();
    var details = detailsInput.value.trim();
    if (actor !== "Matt" || !title) return;
    var requestId = createId("request");
    outbox.push({
      eventId: createId("request-event"),
      requestId: requestId,
      actor: "Matt",
      action: "create",
      title: title.slice(0, 180),
      details: details.slice(0, 1200),
      active: true,
      queuedAt: new Date().toISOString()
    });
    saveOutbox();
    titleInput.value = "";
    detailsInput.value = "";
    render();
    flushOutbox();
  }

  function queueImplemented(request, active){
    outbox.push({
      eventId: createId("request-event"),
      requestId: request.requestId,
      actor: "Jimmy",
      action: "implemented",
      title: "",
      details: "",
      active: Boolean(active),
      queuedAt: new Date().toISOString()
    });
    saveOutbox();
    render();
    flushOutbox();
  }

  async function flushOutbox(){
    if (flushing || !outbox.length || !apiUrl) return;
    flushing = true;
    loadError = "";
    render();
    try {
      while (outbox.length) {
        var response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outbox[0]),
          cache: "no-store"
        });
        var body = await response.json().catch(function(){ return {}; });
        if (!response.ok || !body.ok || !Array.isArray(body.requests)) {
          throw new Error(body.error || "Feature request save failed.");
        }
        requests = body.requests;
        outbox.shift();
        saveOutbox();
        render();
      }
    } catch (error) {
      loadError = error && error.message ? error.message : "Feature requests are temporarily unavailable.";
    } finally {
      flushing = false;
      render();
    }
  }

  async function refreshRequests(){
    if (loading || flushing || !apiUrl) return;
    loading = true;
    renderStatus();
    try {
      var response = await fetch(apiUrl, { cache: "no-store" });
      var body = await response.json().catch(function(){ return {}; });
      if (!response.ok || !body.ok || !Array.isArray(body.requests)) {
        throw new Error(body.error || "Feature requests failed to load.");
      }
      requests = body.requests;
      loadError = "";
    } catch (error) {
      loadError = error && error.message ? error.message : "Feature requests are temporarily unavailable.";
    } finally {
      loading = false;
      render();
    }
  }

  function render(){
    var actor = readActor();
    var visibleRequests = effectiveRequests();
    var openCount = visibleRequests.filter(function(request){
      return !(request.implemented && request.implemented.active);
    }).length;

    list.innerHTML = visibleRequests.length
      ? visibleRequests.map(function(request){ return renderRequest(request, actor); }).join("")
      : '<p class="request-empty">No feature requests yet.</p>';
    updateForm();
    renderStatus(openCount, visibleRequests.length);
  }

  function renderRequest(request, actor){
    var implemented = Boolean(request.implemented && request.implemented.active);
    var itemClass = "request-item" + (implemented ? " implemented" : "") + (request.pending ? " pending" : "");
    var statusText = implemented ? "Implemented" : "Open";
    var actionNote = request.pending
      ? "Saving"
      : implemented && request.implemented.at
        ? "Updated " + formatDate(request.implemented.at)
        : "Requested " + formatDate(request.createdAt);
    return '<article class="' + itemClass + '">' +
      '<div>' +
        '<h4>' + escapeHtml(request.title) + '</h4>' +
        (request.details ? '<p class="request-details">' + escapeHtml(request.details) + '</p>' : '') +
        '<div class="request-meta"><span>From Matt</span><span>' + escapeHtml(formatDate(request.createdAt)) + '</span><span>' + statusText + '</span></div>' +
      '</div>' +
      '<div class="request-action">' +
        '<button type="button" class="' + (implemented ? 'active' : '') + '" data-request-implemented="' + escapeAttribute(request.requestId) + '" aria-pressed="' + String(implemented) + '"' + disableAttribute(actor !== "Jimmy" || request.pending) + '>Implemented</button>' +
        '<span>' + escapeHtml(actionNote) + '</span>' +
      '</div>' +
    '</article>';
  }

  function effectiveRequests(){
    var byId = {};
    requests.forEach(function(request){ byId[request.requestId] = copyRequest(request); });
    outbox.forEach(function(entry){
      if (entry.action === "create") {
        byId[entry.requestId] = {
          requestId: entry.requestId,
          title: entry.title,
          details: entry.details,
          requestedBy: "Matt",
          createdAt: entry.queuedAt,
          implemented: null,
          pending: true
        };
      } else if (entry.action === "implemented" && byId[entry.requestId]) {
        byId[entry.requestId].implemented = {
          active: entry.active,
          actor: "Jimmy",
          at: entry.queuedAt
        };
        byId[entry.requestId].pending = true;
      }
    });
    return Object.keys(byId).map(function(id){ return byId[id]; }).sort(function(left, right){
      return String(right.createdAt).localeCompare(String(left.createdAt));
    });
  }

  function copyRequest(request){
    return {
      requestId: request.requestId,
      title: request.title,
      details: request.details || "",
      requestedBy: request.requestedBy || "Matt",
      createdAt: request.createdAt,
      implemented: request.implemented ? {
        active: Boolean(request.implemented.active),
        actor: request.implemented.actor,
        at: request.implemented.at,
        eventId: request.implemented.eventId
      } : null,
      pending: false
    };
  }

  function updateForm(){
    var canSubmit = readActor() === "Matt" && Boolean(apiUrl);
    titleInput.disabled = !canSubmit;
    detailsInput.disabled = !canSubmit;
    submitButton.disabled = !canSubmit || !titleInput.value.trim() || flushing;
  }

  function renderStatus(openCount, totalCount){
    status.classList.toggle("error", Boolean(loadError));
    if (loadError) {
      status.textContent = outbox.length ? "Request queued; reconnecting" : "Feature requests unavailable; retrying";
    } else if (flushing || outbox.length) {
      status.textContent = "Saving request";
    } else if (loading) {
      status.textContent = "Refreshing requests";
    } else {
      status.textContent = String(openCount || 0) + " open / " + String(totalCount || 0) + " total";
    }
  }

  function findRequest(id){
    return effectiveRequests().find(function(request){ return request.requestId === id; });
  }

  function saveOutbox(){ localStorage.setItem(outboxStorageKey, JSON.stringify(outbox)); }

  function readArray(key){
    try {
      var value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) { return []; }
  }

  function readActor(){
    var value = localStorage.getItem(actorStorageKey) || "";
    return value === "Matt" || value === "Jimmy" ? value : "Jimmy";
  }

  function createId(prefix){
    if (window.crypto && typeof window.crypto.randomUUID === "function") return prefix + "-" + window.crypto.randomUUID();
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function formatDate(value){
    var date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  function disableAttribute(disabled){ return disabled ? ' disabled aria-disabled="true"' : ""; }

  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value){ return escapeHtml(value || ""); }
})();
