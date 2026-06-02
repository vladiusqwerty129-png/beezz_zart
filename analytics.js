(function () {
  var META_PIXEL_ID = '974705331864130';
  var GA_MEASUREMENT_ID = 'G-GB3KCNSD2D';
  var SCROLL_MARKS = [25, 50, 75, 100];

  function loadGoogleAnalytics() {
    if (!GA_MEASUREMENT_ID) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  function loadMetaPixel() {
    if (!META_PIXEL_ID) return;

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

  window.beezzTrackCustom = function (name, params) {
    if (!window.fbq || !name) return;
    window.fbq('trackCustom', name, params || {});
  };

  window.beezzTrackLead = function () {
    window.beezzTrackCustom('Lead');
    if (window.gtag) {
      window.gtag('event', 'generate_lead', { send_to: GA_MEASUREMENT_ID });
    }
  };

  function pageFile() {
    var path = window.location.pathname || '';
    return path.split('/').pop() || 'index.html';
  }

  function isFlashesPage(file) {
    if (!file || file === 'flash-quote.html') return false;
    if (file === 'flashes.html') return true;
    return /^flashes-.+\.html$/i.test(file);
  }

  function trackPageContext() {
    var file = pageFile();
    if (file === 'flashes-gallery.html') {
      window.beezzTrackCustom('Gallery');
      return;
    }
    if (isFlashesPage(file)) {
      window.beezzTrackCustom('Flashes');
    }
  }

  function linkTargetFile(href) {
    if (!href || href.charAt(0) === '#') return '';
    try {
      return new URL(href, window.location.href).pathname.split('/').pop() || '';
    } catch (err) {
      return '';
    }
  }

  function initClickTracking() {
    document.addEventListener(
      'click',
      function (e) {
        var link = e.target.closest('a[href]');
        if (!link) return;

        var href = link.getAttribute('href') || '';
        if (/instagram\.com\/beezz_zart/i.test(href)) {
          window.beezzTrackCustom('Instagram');
          return;
        }

        var file = linkTargetFile(href);
        if (file === 'flashes-gallery.html') {
          window.beezzTrackCustom('Gallery');
          return;
        }
        if (isFlashesPage(file)) {
          window.beezzTrackCustom('Flashes');
        }
      },
      true
    );
  }

  function initScrollTracking() {
    var fired = {};
    function onScroll() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = Math.round(((window.scrollY || doc.scrollTop) / max) * 100);
      SCROLL_MARKS.forEach(function (mark) {
        if (pct >= mark && !fired[mark]) {
          fired[mark] = true;
          window.beezzTrackCustom('Scroll', { depth: mark });
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    loadGoogleAnalytics();
    loadMetaPixel();
    trackPageContext();
    initClickTracking();
    initScrollTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
