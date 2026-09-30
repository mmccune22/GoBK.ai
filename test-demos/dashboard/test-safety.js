/* Test-only wrapper. Never copy this artifact over the original source. */
(function () {
  "use strict";
  window.__MATT_ISOLATED_TEST__ = true;
  function mount() {
    var banner = document.createElement("aside");
    banner.id = "matt-isolated-test-banner";
    banner.setAttribute("role", "note");
    banner.setAttribute("aria-label", "Public isolated test copy");
    banner.style.cssText = "position:fixed;inset:auto 0 0;z-index:2147483647;box-sizing:border-box;width:100%;background:#fff2bd;color:#291b00;border-top:3px solid #a56600;padding:12px 18px max(12px,env(safe-area-inset-bottom));font:14px/1.45 system-ui,sans-serif;text-align:left;box-shadow:0 -3px 18px #0002";
    var title = document.createElement("strong");
    title.textContent = "PUBLIC TEST COPY — FAKE DATA ONLY. No real authentication or secure client storage.";
    var details = document.createElement("div");
    details.textContent = "Do not enter real client information, credentials, or documents. Shared review and address services are disabled. Demo data stays in this browser; external links leave this test.";
    banner.append(title, details);
    document.body.appendChild(banner);
    var originalPadding = parseFloat(window.getComputedStyle(document.body).paddingBottom) || 0;
    function reserveSpace() {
      document.body.style.paddingBottom = (originalPadding + banner.offsetHeight + 12) + "px";
    }
    reserveSpace();
    window.addEventListener("resize", reserveSpace);
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(reserveSpace).observe(banner);
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      var target;
      try { target = new URL(link.getAttribute("href"), window.location.href); } catch (_) { return; }
      if (["http:", "https:", "mailto:", "tel:"].indexOf(target.protocol) === -1) return;
      if ((target.protocol === "http:" || target.protocol === "https:") && target.origin === window.location.origin) return;
      if (!window.confirm("This link leaves the isolated test and may open a live website or contact app. Do not send or submit test data there. Continue?")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
