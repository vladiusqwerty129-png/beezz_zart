document.addEventListener('DOMContentLoaded', () => {
  window.beezzInitFlashesZonePage({
    gridId: 'flashesBodyFrontGrid',
    backId: 'flashesCatalogBack',
    styleCrumbId: 'flashesBodyFrontCrumbStyle',
    zonesKey: 'BODY_FRONT_ZONES',
    partId: 'body-front',
    pageTitle: 'Body Front',
    imgV: window.FLASHES_IMG_V || '82',
  });
});
