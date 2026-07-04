document.addEventListener('DOMContentLoaded', () => {
  window.beezzInitFlashesZonePage({
    gridId: 'flashesHeadGrid',
    backId: 'flashesCatalogBack',
    styleCrumbId: 'flashesHeadCrumbStyle',
    zonesKey: 'HEAD_ZONES',
    partId: 'head',
    pageTitle: 'Head',
    imgV: window.FLASHES_IMG_V || '89',
  });
});
