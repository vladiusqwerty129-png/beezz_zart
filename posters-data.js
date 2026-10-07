window.POSTERS_IMG_V = '1';

window.POSTERS = [
  {
    id: 'poster-1',
    title: 'Symmetric Flow',
    cardSubtitle: '9.4″ × 24″ · Edition of 10 · Signed & numbered',
    preview: 'Website Images/Posters/web/poster-1-main.webp',
    images: [
      'Website Images/Posters/web/poster-1-main.webp',
      'Website Images/Posters/web/poster-1-detail-1.webp',
      'Website Images/Posters/web/poster-1-detail-2.webp',
      'Website Images/Posters/web/poster-1-detail-3.webp',
    ],
    paragraphs: [
      'Original dark blackwork design, reproduced as a limited-edition fine art print.',
      'For this piece, I played with movement and symmetry — flowing linework that mirrors itself down the center, echoing the freehand approach I use in my tattoo work. High-contrast black, grey, and white on 9.4″ × 24″ fine art paper with a subtle grainy texture that gives it a tactile, hand-printed feel.',
      'Each print is signed and numbered by hand. Only 10 prints exist in this edition — once they\u2019re gone, this design won\u2019t be reprinted.',
      'Perfect for anyone into blackwork tattoo art, dark line work, or bold graphic wall pieces.',
    ],
    details: [
      { label: 'Size', value: '9.4″ × 24″' },
      { label: 'Paper', value: 'Grainy-textured fine art paper, archival quality' },
      { label: 'Edition', value: 'Signed and numbered (10/10 edition)' },
      { label: 'Shipping', value: 'Ships worldwide' },
    ],
    mailSubject: 'Poster inquiry — Symmetric Flow',
  },
  {
    id: 'poster-2',
    title: 'Smoke Drift',
    cardSubtitle: '7″ × 17″ · Edition of 15',
    preview: 'Website Images/Posters/web/poster-2-main.webp',
    images: [
      'Website Images/Posters/web/poster-2-main.webp',
      'Website Images/Posters/web/poster-2-detail-1.webp',
      'Website Images/Posters/web/poster-2-detail-2.webp',
      'Website Images/Posters/web/poster-2-detail-3.webp',
    ],
    paragraphs: [
      'Original dark blackwork design, hand-drawn freehand and reproduced as a limited-edition fine art print.',
      'Smoke-like linework curls and drifts across a grey gradient background, echoing the freehand approach I use in my tattoo work. High-contrast black, grey, and white on 7″ × 17″ fine art paper with a subtle grainy texture that gives it a tactile, hand-printed feel.',
      'Only 15 prints exist in this edition — once they\u2019re gone, this design won\u2019t be reprinted.',
    ],
    details: [
      { label: 'Size', value: '7″ × 17″' },
      { label: 'Paper', value: 'Grainy-textured fine art paper, archival quality' },
      { label: 'Edition', value: 'Limited edition of 15' },
      { label: 'Shipping', value: 'Ships worldwide' },
    ],
    mailSubject: 'Poster inquiry — Smoke Drift',
  },
];

window.getPosterById = function (id) {
  return (window.POSTERS || []).find((p) => p.id === id) || null;
};
