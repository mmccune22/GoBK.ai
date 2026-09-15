(() => {
  'use strict';
  const origin = 'https://gobk-checkup-beta.jimmydanol.chatgpt.site';
  const maximumPixels = 50000;
  function locate() {
    const section = document.getElementById('pg-bankruptcy-checkup-beta-v2');
    return { section, frame: (section || document).querySelector('iframe[data-gobk-checkup-beta-v2]') };
  }
  function requestMeasure() {
    const { section, frame } = locate();
    if (section?.hidden || !frame?.contentWindow) return;
    frame.contentWindow.postMessage({ type: 'gobk-checkup:measure' }, origin);
  }
  function pixels(value) {
    return Number.isSafeInteger(value) && value >= 0 && value <= maximumPixels;
  }
  addEventListener('message', event => {
    if (event.origin !== origin) return;
    const { section, frame } = locate();
    if (!frame || event.source !== frame.contentWindow) return;
    if (event.data === 'gobk-checkup:show-panel') {
      if (!section?.hidden) frame.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
    const data = event.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
    const keys = Object.keys(data).sort().join(',');
    if (data.type === 'gobk-checkup:resize' && keys === 'height,type') {
      if (pixels(data.height) && data.height >= 50) {
        frame.style.height = data.height + 'px';
        requestMeasure();
      }
    } else if (data.type === 'gobk-checkup:reveal' && keys === 'top,type') {
      if (section?.hidden || !pixels(data.top) || data.top > parseInt(frame.style.height || frame.height, 10)) return;
      window.scrollTo({ top: Math.max(0, window.scrollY + frame.getBoundingClientRect().top + data.top - 16), behavior: 'instant' });
    }
  });
  addEventListener('hashchange', requestMeasure);
  addEventListener('resize', requestMeasure);
  addEventListener('pageshow', requestMeasure);
  addEventListener('load', requestMeasure);
  locate().frame?.addEventListener('load', requestMeasure);
  requestAnimationFrame(requestMeasure);
})();
