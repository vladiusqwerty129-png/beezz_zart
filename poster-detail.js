(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('poster');
  const poster = window.getPosterById ? window.getPosterById(id) : null;

  const titleEl = document.getElementById('posterDetailTitle');
  const ledeEl = document.getElementById('posterDetailLede');
  const copyEl = document.getElementById('posterDetailCopy');
  const detailsEl = document.getElementById('posterDetailDetails');
  const galleryEl = document.getElementById('posterDetailGallery');
  const buyEl = document.getElementById('posterDetailBuy');
  const crumbEl = document.getElementById('posterDetailCrumb');
  const notFound = document.getElementById('posterDetailNotFound');
  const layout = document.getElementById('posterDetailLayout');
  const lightbox = document.getElementById('posterDetailLightbox');
  const lightboxImg = document.getElementById('posterDetailLightboxImg');
  const lightboxClose = document.getElementById('posterDetailLightboxClose');

  if (!poster) {
    if (titleEl) titleEl.textContent = 'Print not found';
    if (layout) layout.hidden = true;
    if (notFound) notFound.hidden = false;
    document.title = 'Print not found — Beezz_zart';
    return;
  }

  const imgV = window.POSTERS_IMG_V || '1';
  const previewUrl = window.beezzCatalogPreviewUrl
    ? (path) => window.beezzCatalogPreviewUrl(path, imgV)
    : (path) => `${path}?v=${imgV}`;

  document.title = `${poster.title} — Shop Posters & Art — Beezz_zart`;
  if (titleEl) titleEl.textContent = poster.title;
  if (ledeEl) ledeEl.textContent = poster.cardSubtitle || '';
  if (crumbEl) crumbEl.textContent = poster.title;

  if (copyEl && poster.paragraphs) {
    copyEl.innerHTML = poster.paragraphs.map((p) => `<p>${p}</p>`).join('');
  }

  if (detailsEl && poster.details) {
    detailsEl.innerHTML = poster.details
      .map(
        (row) =>
          `<div class="poster-detail__detail-row"><dt>${row.label}</dt><dd>${row.value}</dd></div>`
      )
      .join('');
  }

  if (buyEl) {
    buyEl.href = `poster-inquiry.html?poster=${encodeURIComponent(poster.id)}`;
  }

  if (!galleryEl || !poster.images || !poster.images.length) return;

  let activeIndex = 0;

  galleryEl.innerHTML = `
    <figure class="poster-detail__main">
      <button type="button" class="poster-detail__main-btn" id="posterDetailMainBtn" aria-label="View full size">
        <img class="poster-detail__main-img" id="posterDetailMainImg" src="" alt="" width="940" height="2400" />
      </button>
      <span class="poster-detail__main-hint">Tap image to zoom</span>
    </figure>
    <div class="poster-detail__thumbs" id="posterDetailThumbs" role="list" aria-label="More photos"></div>
  `;

  const mainImg = document.getElementById('posterDetailMainImg');
  const mainBtn = document.getElementById('posterDetailMainBtn');
  const thumbsEl = document.getElementById('posterDetailThumbs');

  function altForIndex(i) {
    return i === 0 ? poster.title : `${poster.title} — photo ${i + 1}`;
  }

  function setActiveIndex(index) {
    activeIndex = index;
    const path = poster.images[index];
    const src = previewUrl(path);
    if (mainImg) {
      mainImg.src = src;
      mainImg.alt = altForIndex(index);
    }
    if (thumbsEl) {
      thumbsEl.querySelectorAll('.poster-detail__thumb').forEach((btn) => {
        const thumbIndex = Number(btn.dataset.imageIndex);
        const isActive = thumbIndex === index;
        btn.classList.toggle('poster-detail__thumb--active', isActive);
        btn.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }
  }

  const thumbImages = poster.images.slice(1);

  thumbImages.forEach((path, thumbIdx) => {
    const imageIndex = thumbIdx + 1;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'poster-detail__thumb';
    btn.setAttribute('role', 'listitem');
    btn.dataset.imageIndex = String(imageIndex);
    btn.setAttribute('aria-label', `Show ${altForIndex(imageIndex)}`);
    btn.innerHTML = `<img src="${previewUrl(path)}" alt="" loading="lazy" width="72" height="96" />`;
    btn.addEventListener('click', () => setActiveIndex(imageIndex));
    thumbsEl.appendChild(btn);
  });

  setActiveIndex(0);

  function openLightbox() {
    if (!lightbox || !lightboxImg || !mainImg) return;
    lightboxImg.src = mainImg.src;
    lightboxImg.alt = mainImg.alt;
    lightbox.hidden = false;
    document.body.classList.add('poster-lightbox-open');
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove('poster-lightbox-open');
    if (mainBtn) mainBtn.focus();
  }

  if (mainBtn) {
    mainBtn.addEventListener('click', openLightbox);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });
})();
