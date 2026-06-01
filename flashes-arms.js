document.addEventListener('DOMContentLoaded', () => {
  const armsGrid = document.getElementById('flashesArmsGrid');
  const backLink = document.getElementById('flashesArmsBack');
  const params = new URLSearchParams(window.location.search);
  const styleId = params.get('style');

  if (!styleId || !window.FLASH_STYLES?.some((s) => s.id === styleId)) {
    window.location.replace('flashes.html');
    return;
  }

  if (styleId !== (window.FLASH_STYLE_USES_PLACEMENT || 'dark-abstract')) {
    window.location.replace(
      `flashes-gallery.html?style=${encodeURIComponent(styleId)}&part=all`
    );
    return;
  }

  if (backLink) {
    backLink.href = `flashes-body.html?style=${encodeURIComponent(styleId)}`;
  }

  if (!armsGrid || !window.ARM_ZONES) return;

  const imgV = window.FLASHES_IMG_V || '84';

  function previewUrl(path) {
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  window.ARM_ZONES.forEach((zone) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flashes-style-card flashes-style-card--pick';
    btn.setAttribute('aria-label', `Choose ${zone.label}`);
    btn.innerHTML = `
      <span class="flashes-style-card__box">
        <span class="flashes-style-card__preview flashes-style-card__preview--bodypart">
          <img src="${previewUrl(zone.preview)}" alt="${zone.label}" loading="lazy" />
        </span>
        <span class="flashes-style-card__meta">
          <span class="flashes-style-card__radio" aria-hidden="true"></span>
          <span class="flashes-style-card__name">${zone.label}</span>
        </span>
      </span>
    `;
    window.beezzMobileTap(btn, function () {
      const q = new URLSearchParams({
        style: styleId,
        part: 'arms',
        zone: zone.id,
      });
      window.location.assign(`flashes-gallery.html?${q.toString()}`);
    });
    armsGrid.appendChild(btn);
  });
});
