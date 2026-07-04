document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('flashesGrid');
  const emptyEl = document.getElementById('flashesEmpty');
  const titleEl = document.getElementById('flashesGalleryTitle');
  const ledeEl = document.getElementById('flashesGalleryLede');
  const hintEl = document.getElementById('flashesGalleryHint');
  const backEl = document.getElementById('flashesCatalogBack');
  const styleCrumb = document.getElementById('flashesGalleryCrumbStyle');
  const currentCrumb = document.getElementById('flashesGalleryCrumbCurrent');
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

  function getFlashes(sid, pid, zid) {
    if (sid === 'all' && (!pid || pid === 'all')) {
      return window.collectAllCatalogFlashes?.() || [];
    }
    return getFlashesForStyle(sid, pid, zid);
  }

  const styleLabel = window.getFlashStyleLabel?.(styleId) || 'Flashes';
  const titleText = window.formatFlashGalleryTitle(styleId, partId, zoneId);
  const ledeText = window.formatFlashGalleryLede(styleId, partId, zoneId);
  const items = getFlashes(styleId, partId, zoneId);

  if (titleEl) titleEl.textContent = titleText;
  if (ledeEl) ledeEl.textContent = ledeText;
  if (currentCrumb) currentCrumb.textContent = titleText;
  document.title = `${titleText} — Beezz_zart`;

  if (styleCrumb) {
    if (partId === 'all') {
      styleCrumb.href = 'flashes.html';
      styleCrumb.textContent = styleLabel;
    } else if (SUB_PART_PAGES[partId] && zoneId) {
      styleCrumb.href = `${SUB_PART_PAGES[partId]}?style=${encodeURIComponent(styleId)}`;
      styleCrumb.textContent = window.BODY_PARTS?.find((p) => p.id === partId)?.label || styleLabel;
    } else {
      styleCrumb.href = 'flashes.html#dark-abstract';
      styleCrumb.textContent = styleLabel;
    }
  }

  if (partId === 'all') {
    window.beezzSetCatalogBack(backEl, 'flashes.html');
  } else if (SUB_PART_PAGES[partId] && zoneId) {
    window.beezzSetCatalogBack(
      backEl,
      `${SUB_PART_PAGES[partId]}?style=${encodeURIComponent(styleId)}`
    );
  } else if (usesPlacement) {
    window.beezzSetCatalogBack(backEl, 'flashes.html#dark-abstract');
  } else {
    window.beezzSetCatalogBack(backEl, 'flashes.html');
  }

  grid.classList.toggle('flashes-catalog__grid--compact', styleId === 'smaller');
  grid.innerHTML = '';

  if (!items.length) {
    if (emptyEl) emptyEl.hidden = false;
    if (hintEl) hintEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (hintEl) hintEl.hidden = false;

  const imgV = window.FLASHES_IMG_V || '93';

  function quoteUrl(flash) {
    const q = new URLSearchParams();
    q.set('style', styleId);
    q.set('part', partId);
    if (zoneId) q.set('zone', zoneId);
    q.set('flash', flash.src);
    return `flash-quote.html?${q.toString()}`;
  }

  function productLabel(flash) {
    if (!flash.alt) return 'Flash design';
    return flash.alt.replace(/^Dark abstract flash — /i, '').replace(/^Flash — /i, '');
  }

  items.forEach((flash) => {
    grid.appendChild(
      window.beezzCreateCatalogProductLink({
        href: quoteUrl(flash),
        label: productLabel(flash),
        preview: flash.src,
        imgV,
        ariaLabel: `Get a quote for ${flash.alt || 'flash design'}`,
      })
    );
  });
});
