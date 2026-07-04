document.addEventListener('DOMContentLoaded', () => {
  const styleGrid = document.getElementById('flashesStyleGrid');
  const darkGrid = document.getElementById('flashesDarkAbstractGrid');
  if (!styleGrid || !window.FLASH_STYLES) return;

  const imgV = window.FLASHES_IMG_V || '100';
  const placementStyleId = window.FLASH_STYLE_USES_PLACEMENT || 'dark-abstract';
  const mainStyleIds = window.FLASH_STYLES_MAIN_IDS || ['all', 'smaller'];

  mainStyleIds.forEach((styleId) => {
    const style = window.FLASH_STYLES.find((entry) => entry.id === styleId);
    if (!style) return;

    styleGrid.appendChild(
      window.beezzCreateCatalogCard({
        label: style.label,
        preview: style.preview,
        imgV,
        ariaLabel: `View ${style.label} flashes`,
        onTap: () => {
          window.location.assign(
            `flashes-gallery.html?style=${encodeURIComponent(style.id)}&part=all`
          );
        },
      })
    );
  });

  if (!darkGrid || !window.BODY_PARTS) return;

  window.BODY_PARTS.forEach((part) => {
    darkGrid.appendChild(
      window.beezzCreateCatalogCard({
        label: part.label,
        preview: part.preview,
        imgV,
        imageFit: 'contain',
        ariaLabel: `View ${part.label} dark and abstract flashes`,
        onTap: () => window.beezzNavigateBodyPart(placementStyleId, part.id),
      })
    );
  });
});
