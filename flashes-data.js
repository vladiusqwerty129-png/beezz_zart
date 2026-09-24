/**
 * Flash styles, body parts, and catalog.
 * Bump FLASHES_IMG_V when replacing covers.
 */
window.FLASHES_IMG_V = '121';

/** Only this style uses body-part and zone placement pickers. */
window.FLASH_STYLE_USES_PLACEMENT = 'dark-abstract';

/*
 * Replace preview images in Website Images/ with your own artwork.
 */
window.FLASH_STYLES = [
  {
    id: 'all',
    label: 'All Flashes',
    preview: 'Website Images/Flashes/Flash-cover-all-flashes.webp',
  },
  {
    id: 'smaller',
    label: 'Smaller Flashes',
    preview: 'Website Images/Flashes/Flash-cover-smaller-flashes.webp',
  },
  {
    id: 'dark-abstract',
    label: 'Dark & Abstract',
    preview: 'Website Images/Flashes/Flash-cover-dark-abstract.webp',
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
  { id: 'sleeve', label: 'Sleeve', preview: 'Website Images/Arm-Sleeve.webp' },
  { id: 'half-sleeve', label: 'Half Sleeve', preview: 'Website Images/Arm-Half-Sleeve.webp' },
  { id: 'shoulder', label: 'Shoulder', preview: 'Website Images/Arm-Shoulder.webp' },
  { id: 'hand', label: 'Hand', preview: 'Website Images/Arm-Hand.webp' },
  { id: 'palm', label: 'Palm', preview: 'Website Images/Arm-Palm.webp' },
];

/** Leg sub-areas (shown after selecting Legs). Replace previews with your anatomical PNGs. */
window.LEG_ZONES = [
  { id: 'calf', label: 'Calf', preview: 'Website Images/Leg-Calf.webp' },
  { id: 'foot', label: 'Foot', preview: 'Website Images/Leg-Foot.webp' },
  { id: 'thigh', label: 'Thigh', preview: 'Website Images/Leg-Thigh.webp' },
  { id: 'knee', label: 'Knee', preview: 'Website Images/Leg-Knee.webp' },
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
  { id: 'back', label: 'Back', preview: 'Website Images/Back-Back.webp' },
  { id: 'lower-back', label: 'Lower Back', preview: 'Website Images/Back-Lower-Back.webp' },
  { id: 'spine', label: 'Spine', preview: 'Website Images/Back-Spine.webp' },
];

/** Head sub-areas (shown after selecting Head). Replace previews with your anatomical PNGs. */
window.HEAD_ZONES = [
  { id: 'neck', label: 'Neck', preview: 'Website Images/Head-Neck.webp' },
  { id: 'ears', label: 'Ears', preview: 'Website Images/Head-Ears.webp' },
  { id: 'face', label: 'Face', preview: 'Website Images/Head-Face.webp' },
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

/** Empty galleries that should show a coming-soon message instead of the default empty copy. */
window.FLASH_COMING_SOON_PLACEMENTS = [
  { styleId: 'dark-abstract', partId: 'body-front', zoneId: 'sternum', message: 'Coming soon' },
];

window.isFlashComingSoon = function (styleId, partId, zoneId) {
  return window.FLASH_COMING_SOON_PLACEMENTS?.some(
    (entry) =>
      entry.styleId === styleId && entry.partId === partId && entry.zoneId === zoneId
  );
};

window.getFlashEmptyMessage = function (styleId, partId, zoneId) {
  const match = window.FLASH_COMING_SOON_PLACEMENTS?.find(
    (entry) =>
      entry.styleId === styleId && entry.partId === partId && entry.zoneId === zoneId
  );
  return match?.message || 'No flashes in this category yet.';
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
    "arms": {
      "sleeve": [
        { src: "Website Images/Flashes/Flashes-Arm-Sleeve-1.webp", alt: "Dark abstract flash \u2014 arm sleeve 1" },
        { src: "Website Images/Flashes/Flashes-Arm-Sleeve-2.webp", alt: "Dark abstract flash \u2014 arm sleeve 2" },
        { src: "Website Images/Flashes/Flashes-Arm-Sleeve-3.webp", alt: "Dark abstract flash \u2014 arm sleeve 3" },
      ],
      "half-sleeve": [
        { src: "Website Images/Flashes/Flashes-Half-Sleeve-2.webp", alt: "Dark abstract flash \u2014 half sleeve 2" },
        { src: "Website Images/Flashes/Flashes-Half-Sleeve-3.webp", alt: "Dark abstract flash \u2014 half sleeve 3" },
        { src: "Website Images/Flashes/Flashes-Half-Sleeve-4.webp", alt: "Dark abstract flash \u2014 half sleeve 4" },
      ],
      "shoulder": [
        { src: "Website Images/Flashes/Flashes-Shoulder-1.webp", alt: "Dark abstract flash \u2014 shoulder 1" },
        { src: "Website Images/Flashes/Flashes-Shoulder-2.webp", alt: "Dark abstract flash \u2014 shoulder 2" },
        { src: "Website Images/Flashes/Flashes-Shoulder-3.webp", alt: "Dark abstract flash \u2014 shoulder 3" },
        { src: "Website Images/Flashes/Flashes-Shoulder-4.webp", alt: "Dark abstract flash \u2014 shoulder 4" },
        { src: "Website Images/Flashes/Flashes-Shoulder-5.webp", alt: "Dark abstract flash \u2014 shoulder 5" },
      ],
      "hand": [
        { src: "Website Images/Flashes/Flashes-Hand-1.webp", alt: "Dark abstract flash \u2014 hand 1" },
        { src: "Website Images/Flashes/Flashes-Hand-2.webp", alt: "Dark abstract flash \u2014 hand 2" },
        { src: "Website Images/Flashes/Flashes-Hand-3.webp", alt: "Dark abstract flash \u2014 hand 3" },
      ],
      "palm": [
        { src: "Website Images/Flashes/Flashes-Palm-1.webp", alt: "Dark abstract flash \u2014 palm 1" },
      ],
    },
    "legs": {
      "calf": [
        { src: "Website Images/Flashes/Flashes-Calf-1.webp", alt: "Dark abstract flash \u2014 calf 1" },
        { src: "Website Images/Flashes/Flashes-Calf-2.webp", alt: "Dark abstract flash \u2014 calf 2" },
        { src: "Website Images/Flashes/Flashes-Calf-3.webp", alt: "Dark abstract flash \u2014 calf 3" },
      ],
      "foot": [
        { src: "Website Images/Flashes/Flashes-Foot-1.webp", alt: "Dark abstract flash \u2014 foot 1" },
        { src: "Website Images/Flashes/Flashes-Foot-2.webp", alt: "Dark abstract flash \u2014 foot 2" },
        { src: "Website Images/Flashes/Flashes-Foot-3.webp", alt: "Dark abstract flash \u2014 foot 3" },
      ],
      "thigh": [
        { src: "Website Images/Flashes/Flashes-Thigh-1.webp", alt: "Dark abstract flash \u2014 thigh 1" },
        { src: "Website Images/Flashes/Flashes-Thigh-2.webp", alt: "Dark abstract flash \u2014 thigh 2" },
        { src: "Website Images/Flashes/Flashes-Thigh-3.webp", alt: "Dark abstract flash \u2014 thigh 3" },
      ],
      "knee": [
        { src: "Website Images/Flashes/Flashes-Knee-1.webp", alt: "Dark abstract flash \u2014 knee 1" },
        { src: "Website Images/Flashes/Flashes-Knee-2.webp", alt: "Dark abstract flash \u2014 knee 2" },
        { src: "Website Images/Flashes/Flashes-Knee-3.webp", alt: "Dark abstract flash \u2014 knee 3" },
      ],
      "sleeve": [
        { src: "Website Images/Flashes/Flashes-Leg-Sleeve-1.webp", alt: "Dark abstract flash \u2014 leg sleeve 1" },
      ],
      "butt": [
        { src: "Website Images/Flashes/Flashes-Butt-1.webp", alt: "Dark abstract flash \u2014 butt 1" },
      ],
    },
    "body-front": {
      "stomach": [
        { src: "Website Images/Flashes/Flashes-Stomach-1.webp", alt: "Dark abstract flash \u2014 stomach 1" },
        { src: "Website Images/Flashes/Flashes-Stomach-2.webp", alt: "Dark abstract flash \u2014 stomach 2" },
        { src: "Website Images/Flashes/Flashes-Stomach-3.webp", alt: "Dark abstract flash \u2014 stomach 3" },
        { src: "Website Images/Flashes/Flashes-Stomach-4.webp", alt: "Dark abstract flash \u2014 stomach 4" },
        { src: "Website Images/Flashes/Flashes-Stomach-5.webp", alt: "Dark abstract flash \u2014 stomach 5" },
        { src: "Website Images/Flashes/Flashes-Stomach-6.webp", alt: "Dark abstract flash \u2014 stomach 6" },
        { src: "Website Images/Flashes/Flashes-Stomach-7.webp", alt: "Dark abstract flash \u2014 stomach 7" },
        { src: "Website Images/Flashes/Flashes-Stomach-8.webp", alt: "Dark abstract flash \u2014 stomach 8" },
        { src: "Website Images/Flashes/Flashes-Stomach-9.webp", alt: "Dark abstract flash \u2014 stomach 9" },
      ],
      "chest": [
        { src: "Website Images/Flashes/Flashes-Chest-1.webp", alt: "Dark abstract flash \u2014 chest 1" },
        { src: "Website Images/Flashes/Flashes-Chest-2.webp", alt: "Dark abstract flash \u2014 chest 2" },
        { src: "Website Images/Flashes/Flashes-Chest-3.webp", alt: "Dark abstract flash \u2014 chest 3" },
        { src: "Website Images/Flashes/Flashes-Chest-4.webp", alt: "Dark abstract flash \u2014 chest 4" },
        { src: "Website Images/Flashes/Flashes-Chest-5.webp", alt: "Dark abstract flash \u2014 chest 5" },
        { src: "Website Images/Flashes/Flashes-Chest-6.webp", alt: "Dark abstract flash \u2014 chest 6" },
        { src: "Website Images/Flashes/Flashes-Chest-7.webp", alt: "Dark abstract flash \u2014 chest 7" },
        { src: "Website Images/Flashes/Flashes-Chest-8.webp", alt: "Dark abstract flash \u2014 chest 8" },
        { src: "Website Images/Flashes/Flashes-Chest-9.webp", alt: "Dark abstract flash \u2014 chest 9" },
      ],
      "nipples": [
        { src: "Website Images/Flashes/Flashes-Nipples-1.webp", alt: "Dark abstract flash \u2014 nipples 1" },
        { src: "Website Images/Flashes/Flashes-Nipples-2.webp", alt: "Dark abstract flash \u2014 nipples 2" },
        { src: "Website Images/Flashes/Flashes-Nipples-3.webp", alt: "Dark abstract flash \u2014 nipples 3" },
      ],
      "full-front": [
        { src: "Website Images/Flashes/Flashes-Full-Front-1.webp", alt: "Dark abstract flash \u2014 full front 1" },
        { src: "Website Images/Flashes/Flashes-Full-Front-2.webp", alt: "Dark abstract flash \u2014 full front 2" },
      ],
    },
    "back": {
      "back": [
        { src: "Website Images/Flashes/Flashes-Back-1.webp", alt: "Dark abstract flash \u2014 back 1" },
        { src: "Website Images/Flashes/Flashes-Back-2.webp", alt: "Dark abstract flash \u2014 back 2" },
        { src: "Website Images/Flashes/Flashes-Back-3.webp", alt: "Dark abstract flash \u2014 back 3" },
      ],
      "lower-back": [
        { src: "Website Images/Flashes/Flashes-Lower-Back-1.webp", alt: "Dark abstract flash \u2014 lower back 1" },
        { src: "Website Images/Flashes/Flashes-Lower-Back-2.webp", alt: "Dark abstract flash \u2014 lower back 2" },
      ],
      "spine": [
        { src: "Website Images/Flashes/Flashes-Spine-1.webp", alt: "Dark abstract flash \u2014 spine 1" },
      ],
    },
    "head": {
      "neck": [
        { src: "Website Images/Flashes/Flashes-Neck-1.webp", alt: "Dark abstract flash \u2014 neck 1" },
        { src: "Website Images/Flashes/Flashes-Neck-2.webp", alt: "Dark abstract flash \u2014 neck 2" },
      ],
      "ears": [
        { src: "Website Images/Flashes/Flashes-Ear-1.webp", alt: "Dark abstract flash \u2014 ear 1" },
        { src: "Website Images/Flashes/Flashes-Ear-2.webp", alt: "Dark abstract flash \u2014 ear 2" },
        { src: "Website Images/Flashes/Flashes-Ear-3.webp", alt: "Dark abstract flash \u2014 ear 3" },
        { src: "Website Images/Flashes/Flashes-Ear-4.webp", alt: "Dark abstract flash \u2014 ear 4" },
        { src: "Website Images/Flashes/Flashes-Ear-5.webp", alt: "Dark abstract flash \u2014 ear 5" },
      ],
      "face": [
        { src: "Website Images/Flashes/Flashes-Face-1.webp", alt: "Dark abstract flash \u2014 face 1" },
        { src: "Website Images/Flashes/Flashes-Face-2.webp", alt: "Dark abstract flash \u2014 face 2" },
        { src: "Website Images/Flashes/Flashes-Face-3.webp", alt: "Dark abstract flash \u2014 face 3" },
        { src: "Website Images/Flashes/Flashes-Face-4.webp", alt: "Dark abstract flash \u2014 face 4" },
        { src: "Website Images/Flashes/Flashes-Face-5.webp", alt: "Dark abstract flash \u2014 face 5" },
      ],
    },
  },
  smaller: {
    all: [
      { id: "abstract", src: "Website Images/Flashes/Flashes-Smaller-Abstract-Main.webp", alt: "Smaller flash \u2014 abstract", placementIdeas: [
          { src: "Website Images/Flashes/Flashes-Smaller-Abstract-Placement-1.webp", alt: "Placement inspiration 1 \u2014 abstract" },
          { src: "Website Images/Flashes/Flashes-Smaller-Abstract-Placement-2.webp", alt: "Placement inspiration 2 \u2014 abstract" },
          { src: "Website Images/Flashes/Flashes-Smaller-Abstract-Placement-3.webp", alt: "Placement inspiration 3 \u2014 abstract" },
          { src: "Website Images/Flashes/Flashes-Smaller-Abstract-Placement-4.webp", alt: "Placement inspiration 4 \u2014 abstract" },
          { src: "Website Images/Flashes/Flashes-Smaller-Abstract-Placement-5.webp", alt: "Placement inspiration 5 \u2014 abstract" },
          { src: "Website Images/Flashes/Flashes-Smaller-Abstract-Placement-6.webp", alt: "Placement inspiration 6 \u2014 abstract" },
        ] },
      { id: "dark-flower", src: "Website Images/Flashes/Flashes-Smaller-DarkFlower-Main.webp", alt: "Smaller flash \u2014 dark flower", placementIdeas: [
          { src: "Website Images/Flashes/Flashes-Smaller-DarkFlower-Placement-1.webp", alt: "Placement inspiration 1 \u2014 dark flower" },
        ] },
      { id: "magic-flower", src: "Website Images/Flashes/Flashes-Smaller-MagicFlower-Main.webp", alt: "Smaller flash \u2014 magic flower", placementIdeas: [
          { src: "Website Images/Flashes/Flashes-Smaller-MagicFlower-Placement-1.webp", alt: "Placement inspiration 1 \u2014 magic flower" },
          { src: "Website Images/Flashes/Flashes-Smaller-MagicFlower-Placement-2.webp", alt: "Placement inspiration 2 \u2014 magic flower" },
        ] },
      { id: "mushroom", src: "Website Images/Flashes/Flashes-Smaller-Mushroom-Main.webp", alt: "Smaller flash \u2014 mushroom", placementIdeas: [
          { src: "Website Images/Flashes/Flashes-Smaller-Mushroom-Placement-1.webp", alt: "Placement inspiration 1 \u2014 mushroom" },
          { src: "Website Images/Flashes/Flashes-Smaller-Mushroom-Placement-2.webp", alt: "Placement inspiration 2 \u2014 mushroom" },
        ] },
      { id: "star", src: "Website Images/Flashes/Flashes-Smaller-Star-Main.webp", alt: "Smaller flash \u2014 star", placementIdeas: [
          { src: "Website Images/Flashes/Flashes-Smaller-Star-Placement-1.webp", alt: "Placement inspiration 1 \u2014 star" },
          { src: "Website Images/Flashes/Flashes-Smaller-Star-Placement-2.webp", alt: "Placement inspiration 2 \u2014 star" },
          { src: "Website Images/Flashes/Flashes-Smaller-Star-Placement-3.webp", alt: "Placement inspiration 3 \u2014 star" },
          { src: "Website Images/Flashes/Flashes-Smaller-Star-Placement-4.webp", alt: "Placement inspiration 4 \u2014 star" },
          { src: "Website Images/Flashes/Flashes-Smaller-Star-Placement-5.webp", alt: "Placement inspiration 5 \u2014 star" },
        ] },
      { id: "thorns", src: "Website Images/Flashes/Flashes-Smaller-Thorns-Main.webp", alt: "Smaller flash \u2014 thorns", placementIdeas: [
          { src: "Website Images/Flashes/Flashes-Smaller-Thorns-Placement-1.webp", alt: "Placement inspiration 1 \u2014 thorns" },
          { src: "Website Images/Flashes/Flashes-Smaller-Thorns-Placement-2.webp", alt: "Placement inspiration 2 \u2014 thorns" },
          { src: "Website Images/Flashes/Flashes-Smaller-Thorns-Placement-3.webp", alt: "Placement inspiration 3 \u2014 thorns" },
          { src: "Website Images/Flashes/Flashes-Smaller-Thorns-Placement-4.webp", alt: "Placement inspiration 4 \u2014 thorns" },
          { src: "Website Images/Flashes/Flashes-Smaller-Thorns-Placement-5.webp", alt: "Placement inspiration 5 \u2014 thorns" },
          { src: "Website Images/Flashes/Flashes-Smaller-Thorns-Placement-6.webp", alt: "Placement inspiration 6 \u2014 thorns" },
        ] },
      { id: "underground-flower", src: "Website Images/Flashes/Flashes-Smaller-UndergroundFlower-Main.webp", alt: "Smaller flash \u2014 underground flower", placementIdeas: [
          { src: "Website Images/Flashes/Flashes-Smaller-UndergroundFlower-Placement-1.webp", alt: "Placement inspiration 1 \u2014 underground flower" },
        ] },
      { src: "Website Images/Flashes/Flashes-Smaller-Flow-Branch.webp", alt: "Smaller flash \u2014 flow branch" },
      { src: "Website Images/Flashes/Flashes-Smaller-Flow-Heart.webp", alt: "Smaller flash \u2014 flow heart" },
      { src: "Website Images/Flashes/Flashes-Smaller-Flow-Star.webp", alt: "Smaller flash \u2014 flow star" },
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
    (flash?.placementIdeas || []).forEach((idea) => {
      if (idea?.src) seen.add(idea.src);
    });
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

window.getFlashCatalogItems = function (styleId, partId, zoneId) {
  if (styleId === 'all' && (!partId || partId === 'all')) {
    return window.collectAllCatalogFlashes?.() || [];
  }

  const entry = window.FLASHES_CATALOG?.[styleId];
  if (!entry) return [];
  if (Array.isArray(entry)) return entry;

  const partEntry = entry[partId];
  if (partEntry && !Array.isArray(partEntry) && typeof partEntry === 'object') {
    if (zoneId && partEntry[zoneId]?.length) return partEntry[zoneId];
    if (partEntry.all?.length) return partEntry.all;
    return [];
  }

  if (partEntry?.length) return partEntry;
  if (entry.all?.length) return entry.all;

  const seen = new Set();
  const out = [];
  Object.values(entry).forEach((val) => {
    const items = Array.isArray(val) ? val : Object.values(val || {}).flat();
    items.forEach((flash) => {
      if (flash?.src && !seen.has(flash.src)) {
        seen.add(flash.src);
        out.push(flash);
      }
    });
  });
  return out;
};


window.findFlashPlacementIdea = function (styleId, partId, zoneId, flashSrc, placementSrc) {
  if (!flashSrc || !placementSrc) return null;
  const flash = window.findCatalogFlash?.(styleId, partId, zoneId, flashSrc);
  if (!flash?.placementIdeas?.length) return null;
  const target = decodeURIComponent(placementSrc);
  return (
    flash.placementIdeas.find(
      (idea) => idea.src === target || idea.src === placementSrc
    ) || null
  );
};

window.findCatalogFlash = function (styleId, partId, zoneId, flashSrc) {
  if (!flashSrc) return null;
  const target = decodeURIComponent(flashSrc);
  const items = window.getFlashCatalogItems(styleId, partId, zoneId);
  const match = items.find((flash) => flash.src === target || flash.src === flashSrc);
  if (match) return match;
  return (
    window.collectAllCatalogFlashes?.().find(
      (flash) => flash.src === target || flash.src === flashSrc
    ) || null
  );
};
