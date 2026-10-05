const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Whimsical Charm Layered Necklace',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 1250,
    image: 'images/whimsical_charm.jpg',
    tag: 'New Arrival',
    spec: '18K Gold Plated • Multi-pendant',
    description: 'A beautiful four-layer necklace featuring a pink crystal butterfly, a clear crystal heart, a delicate gold butterfly, and a diamond-encrusted flower pendant. Perfect for a whimsical, layered look.'
  },
  {
    id: 'prod-2',
    name: 'Blush Bow Snake Chain Pendant',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 850,
    image: 'images/blush_bow.jpg',
    tag: 'Minimalist',
    spec: '18K Rose Gold Plated • Enamel Bow',
    description: 'A sleek and simple snake chain adorned with a charming pink enamel bow pendant with gold accents. A subtle yet elegant statement piece.'
  },
  {
    id: 'prod-3',
    name: 'Clover & Heart Layered Diamond Necklace',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 1800,
    image: 'images/clover_heart.jpg',
    tag: 'Bestseller',
    spec: '18K Gold Plated • Cubic Zirconia',
    description: 'A stunning two-layer gold chain necklace. The top layer features a brilliant diamond-encrusted clover pendant, while the longer chain holds a captivating crystal heart.'
  },
  {
    id: 'prod-4',
    name: 'Celestial Moon & Emerald Hearts Necklace',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 2100,
    image: 'images/celestial_moon.jpg',
    tag: 'Limited Edition',
    spec: '18K Gold Plated • Emerald & Pearl',
    description: 'An enchanting three-layer necklace featuring a pearl-accented crescent moon, three deep green emerald heart pendants, and a crystal-encrusted open heart on the longest chain.'
  },
  {
    id: 'prod-5',
    name: 'Classic Herringbone & Beaded Double Chain',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 950,
    image: 'images/herringbone_double.jpg',
    tag: 'Everyday Wear',
    spec: '18K Gold Plated • Snake Chain',
    description: 'A timeless double-layered necklace pairing a delicate beaded chain with a classic, highly reflective flat herringbone snake chain. The ultimate essential for effortless elegance.'
  }
];

if (typeof window !== 'undefined') {
  window.SAMPLE_PRODUCTS = SAMPLE_PRODUCTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_PRODUCTS };
}
