/**
 * Flash styles, body parts, and catalog.
 * Bump FLASHES_IMG_V when replacing covers.
 */
window.FLASHES_IMG_V = '105';

/** Only this style uses body-part and zone placement pickers. */
window.FLASH_STYLE_USES_PLACEMENT = 'dark-abstract';

/*
 * Replace preview images in Website Images/ with your own artwork.
 */
window.FLASH_STYLES = [
  {
    id: 'all',
    label: 'All Flashes',
    preview: 'Website Images/Flash-cover-all-flashes.webp',
  },
  {
    id: 'smaller',
    label: 'Smaller Flashes',
    preview: 'Website Images/Flashes-Smaller-1.png',
  },
  {
    id: 'dark-abstract',
    label: 'Dark & Abstract',
    preview: 'Website Images/Flash-cover-dark-abstract.webp',
  },
];

/** Style cards shown on flashes.html (dark & abstract uses body-part cards instead). */
window.FLASH_STYLES_MAIN_IDS = ['all', 'smaller'];

/** Homepage index.html flashes grid — landing cover PNGs 1–6. */
window.HOMEPAGE_FLASHES = [
  { src: 'Website Images/landing-page-flash-cover-1.webp', alt: 'Blackwork tattoo flash cover 1' },
  { src: 'Website Images/landing-page-flash-cover-2.webp', alt: 'Blackwork tattoo flash cover 2' },
  { src: 'Website Images/landing-page-flash-cover-3.webp', alt: 'Blackwork tattoo flash cover 3' },
  { src: 'Website Images/landing-page-flash-cover-4.webp', alt: 'Blackwork tattoo flash cover 4' },
  { src: 'Website Images/landing-page-flash-cover-5.webp', alt: 'Blackwork tattoo flash cover 5' },
  { src: 'Website Images/landing-page-flash-cover-6.webp', alt: 'Blackwork tattoo flash cover 6' },
];

window.BODY_PARTS = [
  { id: 'arms', label: 'Arms', preview: 'Website Images/Body-Arms.webp' },
  { id: 'legs', label: 'Legs', preview: 'Website Images/Body-Legs.webp' },
  { id: 'body-front', label: 'Body Front', preview: 'Website Images/Body-Front.webp' },
  { id: 'back', label: 'Back', preview: 'Website Images/Body-Back.webp' },
  { id: 'head', label: 'Head', preview: 'Website Images/Body-Head.webp' },
];

/** Arm sub-areas (shown after selecting Arms). Replace previews with your anatomical PNGs. */
window.ARM_ZONES = [
  { id: 'hand', label: 'Hand', preview: 'Website Images/Arm-Hand.webp' },
  { id: 'palm', label: 'Palm', preview: 'Website Images/Arm-Palm.webp' },
  { id: 'forearm', label: 'Forearm', preview: 'Website Images/Arm-Forearm.webp' },
  { id: 'shoulder', label: 'Shoulder', preview: 'Website Images/Arm-Shoulder.webp' },
  { id: 'sleeve', label: 'Sleeve', preview: 'Website Images/Arm-Sleeve.webp' },
  { id: 'half-sleeve', label: 'Half Sleeve', preview: 'Website Images/Arm-Half-Sleeve.webp' },
];

/** Leg sub-areas (shown after selecting Legs). Replace previews with your anatomical PNGs. */
window.LEG_ZONES = [
  { id: 'calf', label: 'Calf', preview: 'Website Images/Leg-Calf.webp' },
  { id: 'foot', label: 'Foot', preview: 'Website Images/Leg-Foot.webp' },
  { id: 'thigh', label: 'Thigh', preview: 'Website Images/Leg-Thigh.webp' },
  { id: 'sleeve', label: 'Sleeve', preview: 'Website Images/Leg-Sleeve.webp' },
  { id: 'butt', label: 'Butt', preview: 'Website Images/Leg-Butt.webp' },
];

/** Body front sub-areas (shown after selecting Body Front). Replace previews with your anatomical PNGs. */
window.BODY_FRONT_ZONES = [
  { id: 'stomach', label: 'Stomach', preview: 'Website Images/Front-Stomach.webp' },
  { id: 'chest', label: 'Chest', preview: 'Website Images/Front-Chest.webp' },
  { id: 'nipples', label: 'Nipples', preview: 'Website Images/Front-Nipples.webp' },
  { id: 'sternum', label: 'Sternum', preview: 'Website Images/Front-Sternum.webp' },
  { id: 'full-front', label: 'Full Front', preview: 'Website Images/Front-Full.webp' },
];

/** Back sub-areas (shown after selecting Back). Replace previews with your anatomical PNGs. */
window.BACK_ZONES = [
  { id: 'lower-back', label: 'Lower Back', preview: 'Website Images/Back-Lower-Back.webp' },
  { id: 'back', label: 'Back', preview: 'Website Images/Back-Back.webp' },
  { id: 'spine', label: 'Spine', preview: 'Website Images/Back-Spine.webp' },
];

/** Head sub-areas (shown after selecting Head). Replace previews with your anatomical PNGs. */
window.HEAD_ZONES = [
  { id: 'face', label: 'Face', preview: 'Website Images/Head-Face.webp' },
  { id: 'ears', label: 'Ears', preview: 'Website Images/Head-Ears.webp' },
  { id: 'neck', label: 'Neck', preview: 'Website Images/Head-Neck.webp' },
];

/** Areas that pick a specific zone in a second step (not the parent label). */
window.FLASH_PARTS_WITH_ZONES = ['arms', 'legs', 'body-front', 'back', 'head'];

window.FLASH_ZONE_LISTS = {
  arms: () => window.ARM_ZONES,
  legs: () => window.LEG_ZONES,
  'body-front': () => window.BODY_FRONT_ZONES,
  back: () => window.BACK_ZONES,
  head: () => window.HEAD_ZONES,
};

window.getFlashStyleLabel = function (styleId) {
  return window.FLASH_STYLES?.find((s) => s.id === styleId)?.label || 'Flashes';
};

window.getFlashZoneLabel = function (partId, zoneId) {
  if (!partId || !zoneId) return '';
  const list = window.FLASH_ZONE_LISTS[partId]?.();
  return list?.find((z) => z.id === zoneId)?.label || '';
};

/** Specific placement only (e.g. Hand), never the parent area (e.g. Arms). */
window.getFlashPlacementLabel = function (partId, zoneId) {
  const zoneLabel = window.getFlashZoneLabel(partId, zoneId);
  if (zoneLabel) return zoneLabel;
  if (!partId || partId === 'all') return '';
  if (window.FLASH_PARTS_WITH_ZONES.includes(partId)) return '';
  return window.BODY_PARTS?.find((p) => p.id === partId)?.label || '';
};

window.formatFlashGalleryTitle = function (styleId, partId, zoneId) {
  const styleName = window.getFlashStyleLabel(styleId);
  const placement = window.getFlashPlacementLabel(partId, zoneId);
  return placement ? `${styleName} ${placement}` : styleName;
};

window.formatFlashGalleryLede = function (styleId, partId, zoneId) {
  const styleName = window.getFlashStyleLabel(styleId);
  const placement = window.getFlashPlacementLabel(partId, zoneId);
  if (placement) {
    return `Available ${styleName.toLowerCase()} flashes for ${placement.toLowerCase()}. Each design is tattooed once.`;
  }
  return `Available ${styleName.toLowerCase()} flashes. Each design is tattooed once.`;
};

/** Flashes per style. Use body-part keys where needed; use "all" or flat list as fallback. */
window.FLASHES_CATALOG = {
  'dark-abstract': {
    arms: {
      hand: [
        { src: 'Website Images/Flashes-Hand-1.webp', alt: 'Dark abstract flash — hand 1' },
        { src: 'Website Images/Flashes-Hand-2.webp', alt: 'Dark abstract flash — hand 2' },
        { src: 'Website Images/Flashes-Hand-3.webp', alt: 'Dark abstract flash — hand 3' },
      ],
      palm: [
        { src: 'Website Images/Flashes-Palm-1.webp', alt: 'Dark abstract flash — palm 1' },
      ],
      forearm: [
        { src: 'Website Images/Flashes-Forearm-1.webp', alt: 'Dark abstract flash — forearm 1' },
        { src: 'Website Images/Flashes-Forearm-2.webp', alt: 'Dark abstract flash — forearm 2' },
        { src: 'Website Images/Flashes-Forearm-3.webp', alt: 'Dark abstract flash — forearm 3' },
        { src: 'Website Images/Flashes-Forearm-4.webp', alt: 'Dark abstract flash — forearm 4' },
        { src: 'Website Images/Flashes-Forearm-5.webp', alt: 'Dark abstract flash — forearm 5' },
      ],
      shoulder: [
        { src: 'Website Images/Flashes-Shoulder-1.webp', alt: 'Dark abstract flash — shoulder 1' },
        { src: 'Website Images/Flashes-Shoulder-2.webp', alt: 'Dark abstract flash — shoulder 2' },
        { src: 'Website Images/Flashes-Shoulder-3.webp', alt: 'Dark abstract flash — shoulder 3' },
        { src: 'Website Images/Flashes-Shoulder-4.webp', alt: 'Dark abstract flash — shoulder 4' },
        { src: 'Website Images/Flashes-Shoulder-5.webp', alt: 'Dark abstract flash — shoulder 5' },
        { src: 'Website Images/Flashes-Shoulder-6.webp', alt: 'Dark abstract flash — shoulder 6' },
        { src: 'Website Images/Flashes-Shoulder-7.webp', alt: 'Dark abstract flash — shoulder 7' },
      ],
      sleeve: [
        { src: 'Website Images/Flashes-Arm-Sleeve-1.webp', alt: 'Dark abstract flash — arm sleeve 1' },
        { src: 'Website Images/Flashes-Arm-Sleeve-2.webp', alt: 'Dark abstract flash — arm sleeve 2' },
      ],
      'half-sleeve': [
        { src: 'Website Images/Blackwork-Tattoo-Flash-2.webp', alt: 'Dark abstract flash — half sleeve' },
      ],
    },
    legs: {
      calf: [
        { src: 'Website Images/Flash-Calf-1.webp', alt: 'Dark abstract flash — calf 1' },
        { src: 'Website Images/Flash-Calf-2.webp', alt: 'Dark abstract flash — calf 2' },
        { src: 'Website Images/Flash-Calf-3.webp', alt: 'Dark abstract flash — calf 3' },
        { src: 'Website Images/Flashes-Calf-5.webp', alt: 'Dark abstract flash — calf 4' },
        { src: 'Website Images/Flashes-Calf-7.webp', alt: 'Dark abstract flash — calf 5' },
        { src: 'Website Images/Flashes-Calf-8.webp', alt: 'Dark abstract flash — calf 6' },
        { src: 'Website Images/Flashes-Calf-9.webp', alt: 'Dark abstract flash — calf 7' },
        { src: 'Website Images/Flashes-Calf-10.webp', alt: 'Dark abstract flash — calf 8' },
      ],
      foot: [
        { src: 'Website Images/Blackwork-Tattoo-Flash-3.webp', alt: 'Dark abstract flash — foot' },
      ],
      thigh: [
        { src: 'Website Images/Flashes-Thigh-1.webp', alt: 'Dark abstract flash — thigh 1' },
        { src: 'Website Images/Flashes-Thigh-2.webp', alt: 'Dark abstract flash — thigh 2' },
        { src: 'Website Images/Flashes-Thigh-3.webp', alt: 'Dark abstract flash — thigh 3' },
        { src: 'Website Images/Flashes-Thigh-4.webp', alt: 'Dark abstract flash — thigh 4' },
        { src: 'Website Images/Flashes-Thigh-5.webp', alt: 'Dark abstract flash — thigh 5' },
        { src: 'Website Images/Flashes-Thigh-6.webp', alt: 'Dark abstract flash — thigh 6' },
        { src: 'Website Images/Flashes-Thigh-7.webp', alt: 'Dark abstract flash — thigh 7' },
      ],
      sleeve: [
        { src: 'Website Images/Flashes-Leg-Sleeve-1.webp', alt: 'Dark abstract flash — leg sleeve 1' },
      ],
      butt: [
        { src: 'Website Images/Flashes-Butt-1.webp', alt: 'Dark abstract flash — butt 1' },
      ],
    },
    'body-front': {
      stomach: [
        { src: 'Website Images/Flashes-Stomach-1.webp', alt: 'Dark abstract flash — stomach 1' },
        { src: 'Website Images/Flashes-Stomach-2.webp', alt: 'Dark abstract flash — stomach 2' },
        { src: 'Website Images/Flashes-Stomach-3.webp', alt: 'Dark abstract flash — stomach 3' },
        { src: 'Website Images/Flashes-Stomach-4.webp', alt: 'Dark abstract flash — stomach 4' },
        { src: 'Website Images/Flashes-Stomach-5.webp', alt: 'Dark abstract flash — stomach 5' },
        { src: 'Website Images/Flashes-Stomach-6.webp', alt: 'Dark abstract flash — stomach 6' },
        { src: 'Website Images/Flashes-Stomach-7.webp', alt: 'Dark abstract flash — stomach 7' },
        { src: 'Website Images/Flashes-Stomach-8.webp', alt: 'Dark abstract flash — stomach 8' },
      ],
      chest: [
        { src: 'Website Images/Flashes-Chest-1.webp', alt: 'Dark abstract flash — chest 1' },
        { src: 'Website Images/Flashes-Chest-2.webp', alt: 'Dark abstract flash — chest 2' },
        { src: 'Website Images/Flashes-Chest-3.webp', alt: 'Dark abstract flash — chest 3' },
        { src: 'Website Images/Flashes-Chest-4.webp', alt: 'Dark abstract flash — chest 4' },
        { src: 'Website Images/Flashes-Chest-5.webp', alt: 'Dark abstract flash — chest 5' },
        { src: 'Website Images/Flashes-Chest-6.webp', alt: 'Dark abstract flash — chest 6' },
        { src: 'Website Images/Flashes-Chest-7.webp', alt: 'Dark abstract flash — chest 7' },
      ],
      nipples: [
        { src: 'Website Images/Flashes-Nipples-1.webp', alt: 'Dark abstract flash — nipples 1' },
        { src: 'Website Images/Flashes-Nipples-2.webp', alt: 'Dark abstract flash — nipples 2' },
        { src: 'Website Images/Flashes-Nipples-3.webp', alt: 'Dark abstract flash — nipples 3' },
        { src: 'Website Images/Flashes-Nipples-4.webp', alt: 'Dark abstract flash — nipples 4' },
        { src: 'Website Images/Flashes-Nipples-5.webp', alt: 'Dark abstract flash — nipples 5' },
        { src: 'Website Images/Flashes-Nipples-6.webp', alt: 'Dark abstract flash — nipples 6' },
        { src: 'Website Images/Flashes-Nipples-7.webp', alt: 'Dark abstract flash — nipples 7' },
        { src: 'Website Images/Flashes-Nipples-8.webp', alt: 'Dark abstract flash — nipples 8' },
        { src: 'Website Images/Flashes-Nipples-9.webp', alt: 'Dark abstract flash — nipples 9' },
      ],
      sternum: [
        { src: 'Website Images/Flashes-Sternum-1.webp', alt: 'Dark abstract flash — sternum 1' },
      ],
      'full-front': [
        { src: 'Website Images/Flashes-Body Front-1.webp', alt: 'Dark abstract flash — full front 1' },
      ],
    },
    back: {
      'lower-back': [
        { src: 'Website Images/Flashes-Lower-Back-1.webp', alt: 'Dark abstract flash — lower back 1' },
      ],
      back: [
        { src: 'Website Images/Flashes-Back-1.webp', alt: 'Dark abstract flash — back 1' },
        { src: 'Website Images/Flashes-Back-2.webp', alt: 'Dark abstract flash — back 2' },
        { src: 'Website Images/Flashes-Back-3.webp', alt: 'Dark abstract flash — back 3' },
        { src: 'Website Images/Flashes-Back-4.webp', alt: 'Dark abstract flash — back 4' },
        { src: 'Website Images/Flashes-Back-6.webp', alt: 'Dark abstract flash — back 5' },
        { src: 'Website Images/Flashes-Back-7.webp', alt: 'Dark abstract flash — back 6' },
      ],
      spine: [
        { src: 'Website Images/Blackwork-Tattoo-Flash-3.webp', alt: 'Dark abstract flash — spine' },
      ],
    },
    head: {
      face: [
        { src: 'Website Images/Flashes-Face-1.webp', alt: 'Dark abstract flash — face 1' },
      ],
      ears: [
        { src: 'Website Images/Flashes-Ear-1.webp', alt: 'Dark abstract flash — ear 1' },
        { src: 'Website Images/Flashes-Ear-2.webp', alt: 'Dark abstract flash — ear 2' },
        { src: 'Website Images/Flashes-Ear-3.webp', alt: 'Dark abstract flash — ear 3' },
        { src: 'Website Images/Flashes-Ear-4.webp', alt: 'Dark abstract flash — ear 4' },
        { src: 'Website Images/Flashes-Ear-5.webp', alt: 'Dark abstract flash — ear 5' },
      ],
      neck: [
        { src: 'Website Images/Flashes-Neck-1.webp', alt: 'Dark abstract flash — neck 1' },
      ],
    },
    all: [
      { src: 'Website Images/Blackwork-Tattoo-Flash-1.webp', alt: 'Dark abstract blackwork flash 1' },
      { src: 'Website Images/Blackwork-Tattoo-Flash-2.webp', alt: 'Dark abstract blackwork flash 2' },
      { src: 'Website Images/Blackwork-Tattoo-Flash-3.webp', alt: 'Dark abstract blackwork flash 3' },
    ],
  },
  /*
   * Style galleries (no body placement): add JPGs to Website Images/, then tell the agent.
   * Naming: Flashes-Smaller-1.png (increment 1, 2, 3…)
   * First image can become the style card preview on flashes.html.
   */
  smaller: {
    all: [
      { src: 'Website Images/Flashes-Smaller-1.png', alt: 'Smaller blackwork flash 1' },
      { src: 'Website Images/Flashes-Smaller-2.png', alt: 'Smaller blackwork flash 2' },
      { src: 'Website Images/Flashes-Smaller-3.webp', alt: 'Smaller blackwork flash 3' },
      { src: 'Website Images/Flashes-Smaller-4.png', alt: 'Smaller blackwork flash 4' },
      { src: 'Website Images/Flashes-Smaller-5.png', alt: 'Smaller blackwork flash 5' },
      { src: 'Website Images/Flashes-Smaller-6.webp', alt: 'Smaller blackwork flash 6' },
      { src: 'Website Images/Flashes-Smaller-7.png', alt: 'Smaller blackwork flash 7' },
      { src: 'Website Images/Flashes-Smaller-8.png', alt: 'Smaller blackwork flash 8' },
      { src: 'Website Images/Flashes-Smaller-9.png', alt: 'Smaller blackwork flash 9' },
      { src: 'Website Images/Flashes-Smaller-10.png', alt: 'Smaller blackwork flash 10' },
    ],
  },
};

/** Every unique flash across all styles (for the All Flashes gallery). */
window.collectAllCatalogFlashes = function () {
  const seen = new Set();
  const out = [];
  const add = (flash) => {
    if (flash?.src && !seen.has(flash.src)) {
      seen.add(flash.src);
      out.push(flash);
    }
  };
  Object.values(window.FLASHES_CATALOG || {}).forEach((entry) => {
    if (Array.isArray(entry)) {
      entry.forEach(add);
      return;
    }
    Object.values(entry).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach(add);
      } else if (val && typeof val === 'object') {
        Object.values(val).flat().forEach(add);
      }
    });
  });
  return out;
};
