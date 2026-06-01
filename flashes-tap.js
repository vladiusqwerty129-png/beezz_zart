/**
 * Reliable tap/click on iOS/Android (avoids lost clicks after scroll).
 */
window.beezzMobileTap = function (el, handler) {
  if (!el || !handler) return;

  if ('ontouchstart' in window) {
    var startY = 0;
    var moved = false;

    el.addEventListener(
      'touchstart',
      function (e) {
        startY = e.touches[0].clientY;
        moved = false;
      },
      { passive: true }
    );

    el.addEventListener(
      'touchmove',
      function (e) {
        if (Math.abs(e.touches[0].clientY - startY) > 12) moved = true;
      },
      { passive: true }
    );

    el.addEventListener(
      'touchend',
      function (e) {
        if (moved) return;
        handler(e);
      },
      { passive: true }
    );
    return;
  }

  el.addEventListener('click', handler);
};
