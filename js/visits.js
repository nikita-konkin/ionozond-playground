/* Visit counting through GoatCounter: one image request per page, with no cookies and no
   third-party code. Pages switch by the hash, so every switch is counted as its own path,
   e.g. /ionozond-playground/#sim. A copy opened from disk or localhost, or driven by
   automation, is never counted. */
(function () {
  'use strict';
  if (location.protocol === 'file:' || navigator.webdriver || /^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
  let referrer = document.referrer;
  const count = () => {
    new Image().src = 'https://konkin-nikita.goatcounter.com/count?p=' + encodeURIComponent(location.pathname + location.hash) +
      '&t=' + encodeURIComponent(document.title) + '&r=' + encodeURIComponent(referrer) +
      '&rnd=' + Math.random().toString(36).slice(2);
    referrer = '';
  };
  count();
  window.addEventListener('hashchange', count);
})();
