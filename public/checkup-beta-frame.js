(() => {
  'use strict';
  const origin = 'https://gobk-checkup-beta.jimmydanol.chatgpt.site';
  addEventListener('message', event => {
    if (event.origin !== origin || event.data !== 'gobk-checkup:show-panel') return;
    const section = document.getElementById('pg-bankruptcy-checkup-beta');
    if (section?.hidden) return;
    const frame = (section || document).querySelector('iframe[data-gobk-checkup-beta]');
    if (!frame || event.source !== frame.contentWindow) return;
    // The child has already revealed its panel within its own scroll area.
    frame.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
})();
