document.addEventListener('DOMContentLoaded', () => {
  const legsGrid = document.getElementById('flashesLegsGrid');
  const backLink = document.getElementById('flashesLegsBack');
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

  if (!legsGrid || !window.LEG_ZONES) return;

  const imgV = window.FLASHES_IMG_V || '91';

  function previewUrl(path) {
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  window.LEG_ZONES.forEach((zone) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flashes-style-card flashes-style-card--pick';
    btn.setAttribute('aria-label', `Choose ${zone.label}`);
    const previewClass = `flashes-style-card__preview flashes-style-card__preview--bodypart${zone.mirror ? ' flashes-style-card__preview--mirror' : ''}`;
    btn.innerHTML = `
      <span class="flashes-style-card__box">
        <span class="${previewClass}">
          <img src="${previewUrl(zone.preview)}" alt="${zone.label}" loading="lazy" />
        </span>
        <span class="flashes-style-card__meta">
          <span class="flashes-style-card__radio" aria-hidden="true"></span>
          <span class="flashes-style-card__name">${zone.label}</span>
        </span>
      </span>
    `;
    btn.addEventListener('click', () => {
      const q = new URLSearchParams({
        style: styleId,
        part: 'legs',
        zone: zone.id,
      });
      window.location.href = `flashes-gallery.html?${q.toString()}`;
    });
    legsGrid.appendChild(btn);
  });
});
