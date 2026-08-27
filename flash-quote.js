document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const styleId = params.get('style');
  const partId = params.get('part');
  const zoneId = params.get('zone');
  const flashSrc = params.get('flash');
  const placementSrc = params.get('placement');

  const backLink = document.getElementById('flashQuoteBack');
  const titleEl = document.getElementById('flashQuoteTitle');
  const subtitleEl = document.getElementById('flashQuoteSubtitle');
  const imageEl = document.getElementById('flashQuoteImage');
  const placementsSection = document.getElementById('flashQuotePlacements');
  const placementsGrid = document.getElementById('flashQuotePlacementsGrid');
  const visualsEl = document.getElementById('flashQuoteVisuals');
  const catalogEl = document.querySelector('.flashes-catalog--quote');
  const placementBlock = document.getElementById('flashQuotePlacement');
  const lightbox = document.getElementById('flashLightbox');
  const lightboxImage = document.getElementById('flashLightboxImage');
  const lightboxSelect = document.getElementById('flashLightboxSelect');
  const srcInput = document.getElementById('flashQuoteSrc');
  const placementInput = document.getElementById('flashQuotePlacementSrc');
  const form = document.getElementById('flashQuoteForm');

  let activePlacement = null;
  let lightboxPlacement = null;
  let lightboxButton = null;

  function galleryUrl() {
    const q = new URLSearchParams();
    q.set('style', styleId);
    q.set('part', partId);
    if (zoneId) q.set('zone', zoneId);
    return `flashes-gallery.html?${q.toString()}`;
  }

  function imageUrl(path) {
    const imgV = window.FLASHES_IMG_V || '93';
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  if (!styleId || !partId || !flashSrc) {
    window.location.replace('flashes.html');
    return;
  }

  const flash = window.findCatalogFlash?.(styleId, partId, zoneId, flashSrc);
  if (!flash) {
    window.location.replace(galleryUrl());
    return;
  }

  const galleryTitle = window.formatFlashGalleryTitle(styleId, partId, zoneId);
  const isSmallerWithIdeas =
    styleId === 'smaller' && Array.isArray(flash.placementIdeas) && flash.placementIdeas.length > 0;

  if (placementSrc && !isSmallerWithIdeas) {
    const placementIdea = window.findFlashPlacementIdea?.(
      styleId,
      partId,
      zoneId,
      flashSrc,
      placementSrc
    );
    if (!placementIdea) {
      window.location.replace(galleryUrl());
      return;
    }
    activePlacement = placementIdea;
  }

  if (backLink) backLink.href = galleryUrl();
  document.title = `Quote — ${galleryTitle} — Beezz_zart`;
  if (titleEl) titleEl.textContent = 'Request This Flash';
  if (subtitleEl) subtitleEl.hidden = true;

  if (imageEl) {
    imageEl.src = imageUrl(flash.src);
    imageEl.alt = flash.alt;
  }
  if (srcInput) srcInput.value = flash.src;

  function deselectPlacement() {
    activePlacement = null;
    if (placementInput) placementInput.value = '';
    placementsGrid?.querySelectorAll('.flash-quote__placement-option').forEach((el) => {
      el.classList.remove('flash-quote__placement-option--selected');
      el.setAttribute('aria-pressed', 'false');
    });
    updateLightboxSelectLabel();
  }

  function selectPlacement(idea, btn) {
    activePlacement = idea;
    if (placementInput) placementInput.value = idea?.src || '';
    placementsGrid?.querySelectorAll('.flash-quote__placement-option').forEach((el) => {
      const selected = el === btn;
      el.classList.toggle('flash-quote__placement-option--selected', selected);
      el.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    updateLightboxSelectLabel();
  }

  function updateLightboxSelectLabel() {
    if (!lightboxSelect || !lightboxPlacement) return;
    const isSelected = activePlacement?.src === lightboxPlacement.src;
    lightboxSelect.textContent = isSelected ? 'Remove this placement' : 'Use this placement';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('flash-lightbox-open');
    lightboxPlacement = null;
    lightboxButton = null;
  }

  function openLightbox(idea, btn) {
    if (!lightbox || !lightboxImage) return;
    lightboxPlacement = idea;
    lightboxButton = btn;
    lightboxImage.src = imageUrl(idea.src);
    lightboxImage.alt = idea.alt || 'Placement inspiration';
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('flash-lightbox-open');
    updateLightboxSelectLabel();
    lightbox.querySelector('.flash-lightbox__close')?.focus();
  }

  lightbox?.querySelector('.flash-lightbox__close')?.addEventListener('click', closeLightbox);
  lightbox?.querySelector('.flash-lightbox__backdrop')?.addEventListener('click', closeLightbox);
  lightboxSelect?.addEventListener('click', () => {
    if (!lightboxPlacement || !lightboxButton) return;
    if (activePlacement?.src === lightboxPlacement.src) {
      deselectPlacement();
    } else {
      selectPlacement(lightboxPlacement, lightboxButton);
    }
    closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });

  if (isSmallerWithIdeas && placementsSection && placementsGrid) {
    placementsSection.hidden = false;
    visualsEl?.classList.add('flash-quote__visuals--split');
    catalogEl?.classList.add('flashes-catalog--split');
    if (placementBlock) placementBlock.hidden = true;
    placementsGrid.innerHTML = '';

    flash.placementIdeas.forEach((idea, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flash-quote__placement-option';
      btn.setAttribute('aria-label', idea.alt || `Placement inspiration ${index + 1}`);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `
        <span class="flash-quote__placement-option-media">
          <img src="${imageUrl(idea.src)}" alt="" loading="lazy" draggable="false" width="320" height="400" />
        </span>
      `;
      btn.addEventListener('click', () => {
        if (activePlacement?.src === idea.src) {
          deselectPlacement();
          return;
        }
        openLightbox(idea, btn);
      });
      placementsGrid.appendChild(btn);
    });

    if (placementSrc) {
      const preselected = window.findFlashPlacementIdea?.(
        styleId,
        partId,
        zoneId,
        flashSrc,
        placementSrc
      );
      if (preselected) {
        const matchBtn = [...placementsGrid.children].find(
          (_, i) => flash.placementIdeas[i]?.src === preselected.src
        );
        if (matchBtn) selectPlacement(preselected, matchBtn);
      }
    }
  } else if (placementBlock) {
    placementBlock.hidden = true;
    if (placementsSection) placementsSection.hidden = true;
  }

  if (!isSmallerWithIdeas && styleId !== 'smaller') {
    requestAnimationFrame(() => {
      form?.scrollIntoView({ block: 'center' });
    });
  }

  window.beezzBindFlashQuoteForm({
    form,
    styleId,
    partId,
    zoneId,
    srcInput,
    placementInput,
    getFlash: () => flash,
    getPlacementIdea: () => activePlacement,
  });
});
