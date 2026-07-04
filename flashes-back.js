document.addEventListener('DOMContentLoaded', () => {
  window.beezzInitFlashesZonePage({
    gridId: 'flashesBackGrid',
    backId: 'flashesCatalogBack',
    styleCrumbId: 'flashesBackCrumbStyle',
    zonesKey: 'BACK_ZONES',
    partId: 'back',
    pageTitle: 'Back',
    imgV: window.FLASHES_IMG_V || '85',
  });
});
