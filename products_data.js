const SAMPLE_PRODUCTS = [];

if (typeof window !== 'undefined') {
  window.SAMPLE_PRODUCTS = SAMPLE_PRODUCTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_PRODUCTS };
}
