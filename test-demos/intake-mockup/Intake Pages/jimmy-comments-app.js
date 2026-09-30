(function(){
  // Isolated public test: no shared reads, writes, timers, or queued-message flushes.
  if (window.__MATT_ISOLATED_TEST__) return;
  var meta = window.JIMMY_CHANGE_META || {};
  var apiUrl = meta.reviewMessagesApiUrl || "";
  var actorStorageKey = "mcl_jimmy_changes_actor_v1";
  var outboxStorageKey = "mcl_jimmy_messages_outbox_v1";
  var maxMessageLength = 1200;
  var actor = readActor();
  var messages = [];
  var outbox = readArray(outboxStorageKey);
  var loading = false;
  var flushing = false;
  var clearing = false;
  var loadError = "";
  var forceScroll = true;
  var refreshTimer;
  var lastRenderSignature = null;

  var feed = document.getElementById("messageFeed");
  var form = document.getElementById("messageForm");
  var input = document.getElementById("messageInput");
  var sendButton = document.getElementById("sendMessage");
  var refreshButton = document.getElementById("refreshConversation");
  var clearButton = document.getElementById("clearConversation");
  var status = document.getElementById("conversationStatus");
  var actorLabel = document.getElementById("messageActorLabel");
  var count = document.getElementById("messageCount");

  if (!feed || !form || !input || !sendButton || !refreshButton || !clearButton || !status || !actorLabel || !count) return;

  form.addEventListener("submit", function(event){
    event.preventDefault();
    queueMessage();
  });

  input.addEventListener("input", updateComposer);
  input.addEventListener("keydown", function(event){
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    if (!sendButton.disabled) form.requestSubmit();
  });

  refreshButton.addEventListener("click", function(){
    refreshMessages(true);
  });

  clearButton.addEventListener("click", function(){
    if (!effectiveMessages().length) return;
    if (!window.confirm("Clear all Page 9 chat messages for both Matt and Jimmy? This cannot be undone.")) return;
    clearConversation();
  });

  document.querySelectorAll("[data-reviewer]").forEach(function(button){
    button.addEventListener("click", function(){
      window.setTimeout(function(){
        actor = readActor();
        updateComposer();
        renderMessages();
      }, 0);
    });
  });

  window.addEventListener("online", function(){
    loadError = "";
    flushOutbox();
    refreshMessages();
  });

  document.addEventListener("visibilitychange", function(){
    if (document.visibilityState === "visible") refreshMessages();
  });

  updateComposer();
  renderMessages();
  refreshMessages().finally(function(){ flushOutbox(); });
  refreshTimer = window.setInterval(function(){
    if (document.visibilityState === "visible") refreshMessages();
  }, 30000);
  window.addEventListener("beforeunload", function(){ window.clearInterval(refreshTimer); });

  function queueMessage(){
    var body = input.value.trim();
    actor = readActor();
    if (!body || !actor) return;
    outbox.push({
      messageId: createMessageId(),
      actor: actor,
      body: body.slice(0, maxMessageLength),
      queuedAt: new Date().toISOString()
    });
    saveOutbox();
    input.value = "";
    forceScroll = true;
    updateComposer();
    renderMessages();
    flushOutbox();
  }

  async function clearConversation(){
    if (clearing || loading || flushing || outbox.length || !apiUrl) return;
    clearing = true;
    loadError = "";
    actor = readActor();
    renderStatus();
    try {
      var response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear",
          clearId: createClearId(),
          actor: actor,
          queuedAt: new Date().toISOString()
        }),
        cache: "no-store"
      });
      var body = await response.json().catch(function(){ return {}; });
      if (!response.ok || !body.ok || !Array.isArray(body.messages)) throw new Error(body.error || "Conversation clear failed.");
      replaceMessages(body.messages);
      forceScroll = true;
    } catch (error) {
      loadError = error && error.message ? error.message : "Conversation could not be cleared.";
    } finally {
      clearing = false;
      renderMessages();
    }
  }

  async function flushOutbox(){
    if (flushing || !outbox.length || !apiUrl) return;
    flushing = true;
    loadError = "";
    renderStatus();
    try {
      while (outbox.length) {
        var response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outbox[0]),
          cache: "no-store"
        });
        var body = await response.json().catch(function(){ return {}; });
        if (!response.ok || !body.ok || !body.message) throw new Error(body.error || "Message save failed.");
        mergeMessages([body.message]);
        outbox.shift();
        saveOutbox();
        forceScroll = true;
        renderMessages();
      }
    } catch (error) {
      loadError = error && error.message ? error.message : "Messages are temporarily unavailable.";
    } finally {
      flushing = false;
      renderMessages();
    }
  }

  async function refreshMessages(manual){
    if (loading || !apiUrl) return;
    loading = true;
    if (manual) loadError = "";
    renderStatus();
    try {
      var response = await fetch(apiUrl, { cache: "no-store" });
      var body = await response.json().catch(function(){ return {}; });
      if (!response.ok || !body.ok || !Array.isArray(body.messages)) {
        throw new Error(body.error || "Conversation failed to load.");
      }
      replaceMessages(body.messages);
      loadError = "";
    } catch (error) {
      loadError = error && error.message ? error.message : "Messages are temporarily unavailable.";
    } finally {
      loading = false;
      renderMessages();
    }
  }

  function mergeMessages(nextMessages){
    var byId = {};
    messages.concat(nextMessages || []).forEach(function(message){
      if (!message || !message.messageId || !message.body) return;
      byId[message.messageId] = message;
    });
    messages = Object.keys(byId).map(function(id){ return byId[id]; }).sort(compareMessages);
  }

  function replaceMessages(nextMessages){
    messages = (nextMessages || []).filter(function(message){
      return message && message.messageId && message.body;
    }).slice().sort(compareMessages);
  }

  function renderMessages(){
    actor = readActor();
    var wasNearBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 72;
    var visibleMessages = effectiveMessages();
    var signature = visibleMessages.map(function(message){
      return [message.messageId, message.actor, message.body, message.pending ? "1" : "0"].join("|");
    }).join("~");

    if (signature !== lastRenderSignature) {
      lastRenderSignature = signature;
      feed.innerHTML = visibleMessages.length
        ? visibleMessages.map(renderMessage).join("")
        : '<p class="message-empty">No messages yet.</p>';
      if (forceScroll || wasNearBottom) feed.scrollTop = feed.scrollHeight;
      forceScroll = false;
    }
    updateComposer();
    renderStatus();
  }

  function effectiveMessages(){
    var pending = outbox.map(function(message){
      return {
        messageId: message.messageId,
        actor: message.actor,
        body: message.body,
        createdAt: message.queuedAt,
        pending: true
      };
    });
    var byId = {};
    messages.concat(pending).forEach(function(message){ byId[message.messageId] = message; });
    return Object.keys(byId).map(function(id){ return byId[id]; }).sort(compareMessages);
  }

  function renderMessage(message){
    var actorClass = message.actor === "Jimmy" ? " jimmy" : "";
    var pending = message.pending ? '<span class="message-pending">Sending</span>' : "";
    return '<article class="message' + actorClass + '">' +
      '<div class="message-meta"><span class="message-author">' + escapeHtml(message.actor) + '</span><time datetime="' + escapeAttribute(message.createdAt) + '">' + escapeHtml(formatDate(message.createdAt)) + '</time>' + pending + '</div>' +
      '<p class="message-body">' + escapeHtml(message.body) + '</p>' +
      '</article>';
  }

  function updateComposer(){
    actor = readActor();
    var length = input.value.length;
    actorLabel.textContent = "Message as " + actor;
    input.placeholder = actor === "Matt" ? "Write a message for Jimmy" : "Write a message for Matt";
    count.textContent = length + " / " + maxMessageLength;
    sendButton.disabled = !input.value.trim() || !apiUrl;
  }

  function renderStatus(){
    refreshButton.disabled = loading || clearing;
    clearButton.disabled = loading || clearing || flushing || outbox.length || !effectiveMessages().length;
    status.classList.toggle("error", Boolean(loadError));
    if (loadError) {
      status.textContent = outbox.length ? "Message queued; reconnecting" : "Conversation unavailable; retrying";
    } else if (clearing) {
      status.textContent = "Clearing conversation";
    } else if (flushing || outbox.length) {
      status.textContent = "Saving message";
    } else if (loading) {
      status.textContent = "Refreshing messages";
    } else {
      status.textContent = "Shared and up to date";
    }
  }

  function compareMessages(left, right){
    var byDate = String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
    return byDate || String(left.messageId).localeCompare(String(right.messageId));
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

  function createMessageId(){
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "message-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function createClearId(){
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "clear-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function formatDate(value){
    var date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

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
