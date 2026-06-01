(function () {
  var META_PIXEL_ID = '974705331864130';

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

  window.beezzTrackLead = function () {
    if (window.fbq) window.fbq('track', 'Lead');
  };

  loadMetaPixel();
})();
