document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('flashesGrid');
  const emptyEl = document.getElementById('flashesEmpty');
  const titleEl = document.getElementById('flashesGalleryTitle');
  const ledeEl = document.getElementById('flashesGalleryLede');
  const hintEl = document.getElementById('flashesGalleryHint');
  const backLink = document.getElementById('flashesGalleryBack');
  const params = new URLSearchParams(window.location.search);
  const styleId = params.get('style');
  const partId = params.get('part');
  const zoneId = params.get('zone');

  const SUB_PART_PAGES = {
    arms: 'flashes-arms.html',
    legs: 'flashes-legs.html',
    'body-front': 'flashes-body-front.html',
    back: 'flashes-back.html',
    head: 'flashes-head.html',
  };

  if (!styleId || !partId) {
    window.location.replace('flashes.html');
    return;
  }

  const usesPlacement = styleId === (window.FLASH_STYLE_USES_PLACEMENT || 'dark-abstract');

  if (!usesPlacement && partId !== 'all') {
    window.location.replace(
      `flashes-gallery.html?style=${encodeURIComponent(styleId)}&part=all`
    );
    return;
  }

  if (SUB_PART_PAGES[partId] && !zoneId) {
    if (!usesPlacement) {
      window.location.replace(
        `flashes-gallery.html?style=${encodeURIComponent(styleId)}&part=all`
      );
      return;
    }
    window.location.replace(`${SUB_PART_PAGES[partId]}?style=${encodeURIComponent(styleId)}`);
    return;
  }

  if (backLink) {
    if (partId === 'all') {
      backLink.href = 'flashes.html';
    } else {
      backLink.href =
        SUB_PART_PAGES[partId] && zoneId
          ? `${SUB_PART_PAGES[partId]}?style=${encodeURIComponent(styleId)}`
          : `flashes-body.html?style=${encodeURIComponent(styleId)}`;
    }
  }

  function getCatalogEntry(sid) {
    return window.FLASHES_CATALOG?.[sid];
  }

  function getAllForStyle(sid) {
    const entry = getCatalogEntry(sid);
    if (!entry || Array.isArray(entry)) return entry || [];
    const seen = new Set();
    const out = [];
    Object.values(entry).forEach((list) => {
      const items = Array.isArray(list) ? list : Object.values(list || {}).flat();
      items.forEach((f) => {
        if (f && f.src && !seen.has(f.src)) {
          seen.add(f.src);
          out.push(f);
        }
      });
    });
    return out;
  }

  function getFlashes(sid, pid, zid) {
    if (sid === 'all' && (!pid || pid === 'all')) {
      return window.collectAllCatalogFlashes?.() || [];
    }
    return getFlashesForStyle(sid, pid, zid);
  }

  function getFlashesForStyle(sid, pid, zid) {
    const entry = getCatalogEntry(sid);
    if (!entry) return [];
    if (Array.isArray(entry)) return entry;

    const partEntry = entry[pid];
    if (partEntry && !Array.isArray(partEntry) && typeof partEntry === 'object') {
      if (zid && partEntry[zid]?.length) return partEntry[zid];
      if (partEntry.all?.length) return partEntry.all;
      return [];
    }

    if (partEntry?.length) return partEntry;
    if (entry.all?.length) return entry.all;
    return getAllForStyle(sid);
  }

  const titleText = window.formatFlashGalleryTitle(styleId, partId, zoneId);
  const ledeText = window.formatFlashGalleryLede(styleId, partId, zoneId);
  const items = getFlashes(styleId, partId, zoneId);

  if (titleEl) titleEl.textContent = titleText;
  if (ledeEl) ledeEl.textContent = ledeText;
  document.title = `${titleText} — Beezz_zart`;

  grid.classList.toggle('flashes__grid--compact', styleId === 'smaller');
  grid.dataset.count = String(items.length);
  grid.innerHTML = '';

  if (!items.length) {
    grid.removeAttribute('data-count');
    if (emptyEl) emptyEl.hidden = false;
    if (hintEl) hintEl.hidden = true;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  if (hintEl) hintEl.hidden = false;

  const imgV = window.FLASHES_IMG_V || '93';

  function imageUrl(path) {
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  function quoteUrl(flash) {
    const q = new URLSearchParams();
    q.set('style', styleId);
    q.set('part', partId);
    if (zoneId) q.set('zone', zoneId);
    q.set('flash', flash.src);
    return `flash-quote.html?${q.toString()}`;
  }

  grid.scrollTop = 0;
  const panel = document.querySelector('.flashes-page--gallery .flashes-split__panel');
  if (panel) panel.scrollTop = 0;
  window.scrollTo(0, 0);

  items.forEach((flash) => {
    const href = quoteUrl(flash);
    const link = document.createElement('a');
    link.href = href;
    link.className = 'flashes__item flashes__item--gallery';
    link.setAttribute('aria-label', `Get a quote for ${flash.alt}`);

    const img = document.createElement('img');
    img.src = imageUrl(flash.src);
    img.alt = '';
    img.loading = 'lazy';
    img.draggable = false;

    link.appendChild(img);
    window.beezzMobileTap(link, function (e) {
      if (e && e.preventDefault) e.preventDefault();
      window.location.assign(href);
    });
    grid.appendChild(link);
  });
});
