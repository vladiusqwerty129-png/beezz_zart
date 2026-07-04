window.beezzCatalogPreviewUrl = function (path, imgV) {
  const v = imgV || window.FLASHES_IMG_V || '100';
  return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${v}`;
};

window.beezzSetCatalogCount = function (el, count, singular, plural) {
  if (!el) return;
  const one = singular || 'Item';
  const many = plural || `${one}s`;
  el.textContent = `${count} ${count === 1 ? one : many}`;
};

window.beezzCreateCatalogCard = function (opts) {
  const {
    label,
    preview,
    brand = 'Beezz_zart',
    imgV,
    onTap,
    ariaLabel,
    mediaClass = '',
    imageFit = 'cover',
    mirror = false,
  } = opts;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'flashes-catalog-card';
  btn.setAttribute('role', 'listitem');
  btn.setAttribute('aria-label', ariaLabel || `View ${label}`);

  const mediaClasses = ['flashes-catalog-card__media'];
  if (mediaClass) mediaClasses.push(mediaClass);
  if (imageFit === 'contain') mediaClasses.push('flashes-catalog-card__media--contain');
  if (mirror) mediaClasses.push('flashes-catalog-card__media--mirror');

  const src = window.beezzCatalogPreviewUrl(preview, imgV);

  btn.innerHTML = `
    <span class="${mediaClasses.join(' ')}">
      <img src="${src}" alt="" loading="lazy" width="480" height="600" />
    </span>
    <span class="flashes-catalog-card__info">
      <span class="flashes-catalog-card__brand">${brand}</span>
      <span class="flashes-catalog-card__name">${label}</span>
    </span>
  `;

  window.beezzMobileTap(btn, onTap);
  return btn;
};

window.beezzCreateCatalogProductLink = function (opts) {
  const { href, label, preview, imgV, ariaLabel, tapLabel = 'Tap to get a quote' } = opts;
  const link = document.createElement('a');
  link.href = href;
  link.className = 'flashes-catalog-product';
  link.setAttribute('aria-label', ariaLabel || `Get a quote for ${label || 'flash design'}`);

  const src = window.beezzCatalogPreviewUrl(preview, imgV);
  link.innerHTML = `
    <span class="flashes-catalog-product__media">
      <img src="${src}" alt="" loading="lazy" draggable="false" width="480" height="600" />
    </span>
    <span class="flashes-catalog-product__info">
      <span class="flashes-catalog-product__tap">${tapLabel}</span>
    </span>
  `;

  window.beezzMobileTap(link, function (e) {
    if (e && e.preventDefault) e.preventDefault();
    window.location.assign(href);
  });
  return link;
};

window.beezzSetCatalogBack = function (el, href) {
  if (el && href) el.href = href;
};

window.beezzNavigateBodyPart = function (styleId, partId) {
  const SUB_PART_PAGES = {
    arms: 'flashes-arms.html',
    legs: 'flashes-legs.html',
    'body-front': 'flashes-body-front.html',
    back: 'flashes-back.html',
    head: 'flashes-head.html',
  };

  if (SUB_PART_PAGES[partId]) {
    window.location.assign(
      `${SUB_PART_PAGES[partId]}?style=${encodeURIComponent(styleId)}`
    );
    return;
  }

  window.location.assign(
    `flashes-gallery.html?style=${encodeURIComponent(styleId)}&part=${encodeURIComponent(partId)}`
  );
};

window.beezzInitFlashesZonePage = function (config) {
  const {
    gridId,
    backId,
    styleCrumbId,
    zonesKey,
    partId,
    pageTitle,
    imgV,
  } = config;

  const grid = document.getElementById(gridId);
  const backEl = document.getElementById(backId);
  const styleCrumb = document.getElementById(styleCrumbId);
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

  const zones = window[zonesKey];
  if (!grid || !zones) return;

  const styleLabel = window.getFlashStyleLabel?.(styleId) || 'Flashes';
  if (styleCrumb) {
    styleCrumb.href = 'flashes.html#dark-abstract';
    styleCrumb.textContent = styleLabel;
  }
  window.beezzSetCatalogBack(
    backEl,
    'flashes.html#dark-abstract'
  );
  document.title = `${pageTitle} — ${styleLabel} | Beezz_zart`;

  zones.forEach((zone) => {
    grid.appendChild(
      window.beezzCreateCatalogCard({
        label: zone.label,
        preview: zone.preview,
        imgV,
        imageFit: 'contain',
        mirror: !!zone.mirror,
        ariaLabel: `Choose ${zone.label}`,
        onTap: () => {
          const q = new URLSearchParams({
            style: styleId,
            part: partId,
            zone: zone.id,
          });
          window.location.assign(`flashes-gallery.html?${q.toString()}`);
        },
      })
    );
  });
};
