const DEFAULT_CATEGORIES = [
  { id: 'anti-tarnish-chain', label: 'Anti-Tarnish Chain' },
  { id: 'rings', label: 'Rings' },
  { id: 'mens-chain', label: "Men's Chain" },
  { id: 'bangle', label: 'Bangle' },
  { id: 'fancy-items', label: 'Fancy Items' },
];

if (typeof window !== 'undefined') {
  window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_CATEGORIES };
}
