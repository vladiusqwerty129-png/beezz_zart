document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const styleId = params.get('style');

  if (styleId === (window.FLASH_STYLE_USES_PLACEMENT || 'dark-abstract')) {
    window.location.replace('flashes.html#dark-abstract');
  }
});
