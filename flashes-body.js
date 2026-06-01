document.addEventListener('DOMContentLoaded', () => {
  const bodypartGrid = document.getElementById('flashesBodypartGrid');
  const params = new URLSearchParams(window.location.search);
  const styleId = params.get('style');

  if (!styleId || !window.FLASH_STYLES?.some((s) => s.id === styleId)) {
    window.location.replace('flashes.html');
    return;
  }

  const usesPlacement = window.FLASH_STYLE_USES_PLACEMENT || 'dark-abstract';
  if (styleId !== usesPlacement) {
    window.location.replace(
      `flashes-gallery.html?style=${encodeURIComponent(styleId)}&part=all`
    );
    return;
  }

  if (!bodypartGrid || !window.BODY_PARTS) return;

  const imgV = window.FLASHES_IMG_V || '45';

  function previewUrl(path) {
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  window.BODY_PARTS.forEach((part) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flashes-style-card flashes-style-card--pick';
    btn.setAttribute('aria-label', `Choose ${part.label}`);
    btn.innerHTML = `
      <span class="flashes-style-card__box">
        <span class="flashes-style-card__preview flashes-style-card__preview--bodypart">
          <img src="${previewUrl(part.preview)}" alt="${part.label}" loading="lazy" />
        </span>
        <span class="flashes-style-card__meta">
          <span class="flashes-style-card__radio" aria-hidden="true"></span>
          <span class="flashes-style-card__name">${part.label}</span>
        </span>
      </span>
    `;
    window.beezzMobileTap(btn, function () {
      if (part.id === 'arms') {
        window.location.assign(`flashes-arms.html?style=${encodeURIComponent(styleId)}`);
        return;
      }
      if (part.id === 'legs') {
        window.location.assign(`flashes-legs.html?style=${encodeURIComponent(styleId)}`);
        return;
      }
      if (part.id === 'body-front') {
        window.location.assign(`flashes-body-front.html?style=${encodeURIComponent(styleId)}`);
        return;
      }
      if (part.id === 'back') {
        window.location.assign(`flashes-back.html?style=${encodeURIComponent(styleId)}`);
        return;
      }
      if (part.id === 'head') {
        window.location.assign(`flashes-head.html?style=${encodeURIComponent(styleId)}`);
        return;
      }
      window.location.assign(`flashes-gallery.html?style=${encodeURIComponent(styleId)}&part=${encodeURIComponent(part.id)}`);
    });
    bodypartGrid.appendChild(btn);
  });
});
