document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const styleId = params.get('style');
  const partId = params.get('part');
  const zoneId = params.get('zone');
  const flashSrc = params.get('flash');

  const backLink = document.getElementById('flashQuoteBack');
  const titleEl = document.getElementById('flashQuoteTitle');
  const subtitleEl = document.getElementById('flashQuoteSubtitle');
  const imageEl = document.getElementById('flashQuoteImage');
  const srcInput = document.getElementById('flashQuoteSrc');
  const form = document.getElementById('flashQuoteForm');
  const filloutUrl = form?.dataset.filloutUrl || form?.action;

  function galleryUrl() {
    const q = new URLSearchParams();
    q.set('style', styleId);
    q.set('part', partId);
    if (zoneId) q.set('zone', zoneId);
    return `flashes-gallery.html?${q.toString()}`;
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
        if (f?.src && !seen.has(f.src)) {
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

  function findFlash(sid, pid, zid, src) {
    if (!src) return null;
    const decoded = decodeURIComponent(src);
    return getFlashesForStyle(sid, pid, zid).find((f) => f.src === decoded || f.src === src) || null;
  }

  function imageUrl(path) {
    const imgV = window.FLASHES_IMG_V || '93';
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  if (!styleId || !partId || !flashSrc) {
    window.location.replace('flashes.html');
    return;
  }

  const flash = findFlash(styleId, partId, zoneId, flashSrc);
  if (!flash) {
    window.location.replace(galleryUrl());
    return;
  }

  const galleryTitle = window.formatFlashGalleryTitle(styleId, partId, zoneId);
  const backHref = galleryUrl();

  if (backLink) backLink.href = backHref;
  document.title = `Quote — ${galleryTitle} — Beezz_zart`;
  if (titleEl) titleEl.textContent = 'Request This Flash';
  if (subtitleEl) subtitleEl.textContent = galleryTitle;

  const displaySrc = imageUrl(flash.src);
  const absoluteImg = new URL(flash.src, window.location.href).href;

  if (imageEl) {
    imageEl.src = displaySrc;
    imageEl.alt = flash.alt;
  }
  if (srcInput) srcInput.value = flash.src;

  const flashAttachmentBlock = [
    '--- Selected flash design ---',
    `Category: ${galleryTitle}`,
    `Design: ${flash.alt}`,
    `Image: ${absoluteImg}`,
  ].join('\n');

  form?.addEventListener('submit', (e) => {
    if (!window.beezzRequirePrivacyConsent?.(form)) {
      e.preventDefault();
      return;
    }
    if (!filloutUrl) return;
    e.preventDefault();

    const paramsOut = new URLSearchParams();
    const name = document.getElementById('flashQuoteName')?.value.trim();
    const email = document.getElementById('flashQuoteEmail')?.value.trim();
    const phone = document.getElementById('flashQuotePhone')?.value.trim();
    const userIdea = document.getElementById('flashQuoteIdea')?.value.trim();

    if (name) paramsOut.set('name', name);
    if (email) paramsOut.set('email', email);
    if (phone) paramsOut.set('phone', phone);

    const ideaParts = [];
    if (userIdea) ideaParts.push(userIdea);
    ideaParts.push(flashAttachmentBlock);
    paramsOut.set('idea', ideaParts.join('\n\n'));

    const q = paramsOut.toString();
    window.open(q ? `${filloutUrl}?${q}` : filloutUrl, '_blank', 'noopener,noreferrer');
  });
});
