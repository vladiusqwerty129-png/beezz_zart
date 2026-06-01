document.addEventListener('DOMContentLoaded', () => {
  const styleGrid = document.getElementById('flashesStyleGrid');
  if (!styleGrid || !window.FLASH_STYLES) return;

  const imgV = window.FLASHES_IMG_V || '100';

  function previewUrl(path) {
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  window.FLASH_STYLES.forEach((style) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flashes-style-card flashes-style-card--pick';
    btn.setAttribute('aria-label', `Choose ${style.label}`);
    btn.innerHTML = `
      <span class="flashes-style-card__box">
        <span class="flashes-style-card__preview">
          <img src="${previewUrl(style.preview)}" alt="${style.label}" loading="lazy" />
        </span>
        <span class="flashes-style-card__meta">
          <span class="flashes-style-card__radio" aria-hidden="true"></span>
          <span class="flashes-style-card__name">${style.label}</span>
        </span>
      </span>
    `;
    window.beezzMobileTap(btn, function () {
      const usesPlacement = window.FLASH_STYLE_USES_PLACEMENT || 'dark-abstract';
      if (style.id === usesPlacement) {
        window.location.assign(`flashes-body.html?style=${encodeURIComponent(style.id)}`);
        return;
      }
      window.location.assign(`flashes-gallery.html?style=${encodeURIComponent(style.id)}&part=all`);
    });
    styleGrid.appendChild(btn);
  });
});
