(function () {
  const grid = document.getElementById('shopPostersGrid');
  const empty = document.getElementById('shopPostersEmpty');
  if (!grid || !window.POSTERS) return;

  const posters = window.POSTERS;
  if (!posters.length) return;

  if (empty) empty.hidden = true;

  const imgV = window.POSTERS_IMG_V || '1';
  const previewUrl = window.beezzCatalogPreviewUrl
    ? (path) => window.beezzCatalogPreviewUrl(path, imgV)
    : (path) => `${path}?v=${imgV}`;

  posters.forEach((poster) => {
    const link = document.createElement('a');
    link.href = `poster.html?poster=${encodeURIComponent(poster.id)}`;
    link.className = 'flashes-catalog-product shop-poster-product';
    link.setAttribute('role', 'listitem');
    link.setAttribute('aria-label', `View ${poster.title} print`);

    const src = previewUrl(poster.preview);
    link.innerHTML = `
      <span class="flashes-catalog-product__media shop-poster-product__media">
        <img src="${src}" alt="" loading="lazy" draggable="false" width="520" height="1200" />
      </span>
      <span class="flashes-catalog-product__info">
        <span class="flashes-catalog-product__brand">Limited edition</span>
        <span class="flashes-catalog-product__name">${poster.title}</span>
        <span class="shop-poster-product__meta">${poster.cardSubtitle || ''}</span>
        <span class="flashes-catalog-product__tap">View print</span>
      </span>
    `;

    grid.appendChild(link);
  });
})();
