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
  const infoHtml = tapLabel
    ? `<span class="flashes-catalog-product__info">
      <span class="flashes-catalog-product__tap">${tapLabel}</span>
    </span>`
    : '';

  link.innerHTML = `
    <span class="flashes-catalog-product__media">
      <img src="${src}" alt="" loading="lazy" draggable="false" width="480" height="600" />
    </span>
    ${infoHtml}
  `;

  return link;
};

window.beezzCreateSmallerFlashPicker = function (opts) {
  const { flash, imgV, productLabel, onSelect, isActive } = opts;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'flashes-catalog-product flashes-catalog-product--picker';
  if (isActive) btn.classList.add('flashes-catalog-product--active');
  btn.setAttribute(
    'aria-label',
    `View ${flash.alt || productLabel || 'flash design'}`
  );
  btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

  const src = window.beezzCatalogPreviewUrl(flash.src, imgV);

  btn.innerHTML = `
    <span class="flashes-catalog-product__media">
      <img src="${src}" alt="" loading="lazy" draggable="false" width="480" height="600" />
    </span>
  `;

  btn.addEventListener('click', () => onSelect?.(flash, btn));
  return btn;
};

window.beezzBindFlashQuoteForm = function (config) {
  const {
    form,
    styleId,
    partId,
    zoneId,
    getFlash,
    getPlacementIdea,
    srcInput,
    placementInput,
  } = config;

  if (!form || form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.beezzRequirePrivacyConsent?.(form)) return;
    window.beezzClearFormFeedback?.(form);

    const flash = getFlash?.();
    if (!flash) return;

    const placementIdea = getPlacementIdea?.();
    const galleryTitle = window.formatFlashGalleryTitle?.(styleId, partId, zoneId) || 'Flashes';
    const absoluteImg = new URL(flash.src, window.location.href).href;

    const flashAttachmentBlock = [
      '--- Selected flash design ---',
      `Category: ${galleryTitle}`,
      `Design: ${flash.alt}`,
      `Image: ${absoluteImg}`,
      placementIdea
        ? [
            '',
            '--- Selected placement inspiration ---',
            `Inspiration: ${placementIdea.alt}`,
            `Image: ${new URL(placementIdea.src, window.location.href).href}`,
          ].join('\n')
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (!window.beezzSubmitLead) {
      window.beezzShowFormFeedback?.(
        form,
        'error',
        'Form is not configured. Please try again later.'
      );
      return;
    }

    const name = form.querySelector('[name="name"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const userIdea = form.querySelector('[name="idea"]')?.value.trim();

    const ideaParts = [];
    if (userIdea) ideaParts.push(userIdea);
    ideaParts.push(flashAttachmentBlock);

    window.beezzStartFormSubmit?.(form);

    try {
      await window.beezzSubmitLead({
        name,
        email,
        phone,
        idea: ideaParts.join('\n\n'),
        source: 'flash-quote',
        files: [],
      });
      form.reset();
      if (srcInput) srcInput.value = flash.src;
      if (placementInput) placementInput.value = placementIdea?.src || '';
      window.beezzShowFormFeedback?.(
        form,
        'success',
        "Thank you! Your quote request was sent. I'll get back to you soon."
      );
    } catch (err) {
      window.beezzShowFormFeedback?.(
        form,
        'error',
        err.message || 'Something went wrong. Please try again.'
      );
    }
  });
};

window.beezzCreateCatalogExpandableFlash = function (opts) {
  const {
    flash,
    quoteUrl,
    imgV,
    productLabel,
    onToggle,
  } = opts;

  const article = document.createElement('article');
  article.className = 'flashes-catalog-expandable';
  article.dataset.flashId = flash.id || flash.src;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'flashes-catalog-expandable__trigger flashes-catalog-product';
  trigger.setAttribute(
    'aria-expanded',
    'false'
  );
  trigger.setAttribute(
    'aria-label',
    `Show placement ideas for ${flash.alt || productLabel || 'flash design'}`
  );

  const src = window.beezzCatalogPreviewUrl(flash.src, imgV);
  trigger.innerHTML = `
    <span class="flashes-catalog-product__media">
      <img src="${src}" alt="" loading="lazy" draggable="false" width="480" height="600" />
    </span>
    <span class="flashes-catalog-product__info">
      <span class="flashes-catalog-product__tap">Tap for placement ideas</span>
    </span>
  `;

  const panel = document.createElement('div');
  panel.className = 'flashes-catalog-expandable__panel';
  panel.hidden = true;

  const ideas = flash.placementIdeas || [];
  const ideasHtml = ideas
    .map((idea, index) => {
      const ideaSrc = window.beezzCatalogPreviewUrl(idea.src, imgV);
      const q = new URL(quoteUrl, window.location.href);
      q.searchParams.set('placement', idea.src);
      const href = `${q.pathname}${q.search}`;
      return `
        <a href="${href}" class="flashes-catalog-expandable__idea" aria-label="Get a quote with ${idea.alt || `placement idea ${index + 1}`}">
          <span class="flashes-catalog-expandable__idea-media">
            <img src="${ideaSrc}" alt="" loading="lazy" draggable="false" width="240" height="300" />
          </span>
        </a>
      `;
    })
    .join('');

  panel.innerHTML = `
    <div class="flashes-catalog-expandable__panel-inner">
      <p class="flashes-catalog-expandable__heading">Placement inspiration</p>
      <div class="flashes-catalog-expandable__ideas">${ideasHtml}</div>
      <a href="${quoteUrl}" class="flashes-catalog-expandable__quote">Request this flash</a>
    </div>
  `;

  trigger.addEventListener('click', () => {
    const willOpen = panel.hidden;
    onToggle?.(article, willOpen);
    panel.hidden = !willOpen;
    trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    article.classList.toggle('flashes-catalog-expandable--open', willOpen);
  });

  article.appendChild(trigger);
  article.appendChild(panel);
  return article;
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
