(function () {
  var META_PIXEL_ID = '974705331864130';
  var CONSENT_KEY = 'beezz_cookie_consent';

  function loadMetaPixel() {
    if (!META_PIXEL_ID || window.__beezzMetaLoaded) return;
    window.__beezzMetaLoaded = true;

    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', META_PIXEL_ID);
    }
    window.fbq('track', 'PageView');
  }

  function hideBanner() {
    var el = document.getElementById('beezzCookieBanner');
    if (el) el.hidden = true;
  }

  function showBanner() {
    if (document.getElementById('beezzCookieBanner')) return;

    var banner = document.createElement('div');
    banner.id = 'beezzCookieBanner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
      '<p class="cookie-banner__text">We use cookies for analytics and ads (Meta Pixel) to improve your experience. See our <a href="privacy-policy.html">privacy policy</a>.</p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="cookie-banner__btn cookie-banner__btn--ghost" data-consent="essential">Essential only</button>' +
      '<button type="button" class="cookie-banner__btn cookie-banner__btn--primary" data-consent="all">Accept</button>' +
      '</div></div>';
    document.body.appendChild(banner);

    banner.querySelectorAll('[data-consent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-consent');
        try {
          localStorage.setItem(CONSENT_KEY, value);
        } catch (err) {}
        hideBanner();
        if (value === 'all') loadMetaPixel();
      });
    });
  }

  function init() {
    var consent = '';
    try {
      consent = localStorage.getItem(CONSENT_KEY) || '';
    } catch (err) {}

    if (consent === 'all') {
      loadMetaPixel();
      return;
    }
    if (consent === 'essential') return;
    showBanner();
  }

  window.beezzTrackLead = function () {
    if (window.fbq) window.fbq('track', 'Lead');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
