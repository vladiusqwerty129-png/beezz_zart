document.addEventListener('DOMContentLoaded', () => {
  window.beezzInitFlashesZonePage({
    gridId: 'flashesArmsGrid',
    backId: 'flashesCatalogBack',
    styleCrumbId: 'flashesArmsCrumbStyle',
    zonesKey: 'ARM_ZONES',
    partId: 'arms',
    pageTitle: 'Arms',
    imgV: window.FLASHES_IMG_V || '84',
  });
});
