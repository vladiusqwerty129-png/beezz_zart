document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('homeFlashesGrid');
  if (!grid || !window.HOMEPAGE_FLASHES?.length) return;

  const imgV = window.FLASHES_IMG_V || '94';

  function imageUrl(path) {
    return path.split('/').map((part) => encodeURIComponent(part)).join('/') + `?v=${imgV}`;
  }

  grid.innerHTML = '';
  window.HOMEPAGE_FLASHES.forEach((flash) => {
    const item = document.createElement('div');
    item.className = 'flashes__item';
    item.innerHTML = `<img src="${imageUrl(flash.src)}" alt="${flash.alt}" width="640" height="800" loading="lazy" />`;
    grid.appendChild(item);
  });
});
