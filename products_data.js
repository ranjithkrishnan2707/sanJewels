// 50 High-End Jewelry Products across 5 Luxury Variants (10 items each)
// Variants:
// 1. emerald: 'EMERALD COUTURE'
// 2. rings: 'ROYAL RINGS'
// 3. earrings: 'HIGH EARRINGS'
// 4. bracelets: 'BRACELETS & CUFFS'
// 5. heritage: 'GOLD HERITAGE'

const SAMPLE_PRODUCTS = [
  // ==========================================
  // VARIANT 1: EMERALD COUTURE (10 items)
  // ==========================================
  {
    id: 'prod-1',
    name: 'The Sovereign Royal Emerald Necklace',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 24500,
    image: 'images/emerald_necklace.jpg',
    tag: 'Royal Heritage',
    spec: '24.8 ct Colombian Emerald & 18K Solid Gold',
    description: 'An extraordinary haute joaillerie masterpiece featuring a rare pear-cut Colombian emerald surrounded by concentric tiers of brilliant round diamonds and hand-burnished 18K gold.'
  },
  {
    id: 'prod-2',
    name: 'Verdant Queen Graduated Emerald Collar',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 38200,
    image: 'images/emerald_necklace.jpg',
    tag: 'Masterpiece',
    spec: '31.5 ct Zambian Emeralds • Platinum 950',
    description: 'A regal collar necklace set with seventeen graduated emerald-cut Zambian emeralds, flanked by brilliant baguette-cut diamond halos.'
  },
  {
    id: 'prod-3',
    name: 'Imperial Muzo Emerald Teardrop Pendant',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 16800,
    image: 'images/emerald_necklace.jpg',
    tag: 'Collector Choice',
    spec: '9.4 ct Vivid Muzo Emerald • 18K Yellow Gold',
    description: 'An exquisite single-origin Muzo teardrop emerald suspended on an intricate diamond-encrusted wheat link chain in 18K yellow gold.'
  },
  {
    id: 'prod-4',
    name: 'Crown Princess Emerald & Solitaire Choker',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 29500,
    image: 'images/emerald_necklace.jpg',
    tag: 'Private Vault',
    spec: '18.2 ct Oval Emeralds • 6.4 ct Diamonds',
    description: 'Handcrafted velvet choker style featuring alternating oval cabochon emeralds and brilliant D-color diamonds with custom clasp.'
  },
  {
    id: 'prod-5',
    name: 'Serpentine Emerald & Diamond Lariat',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 19400,
    image: 'images/emerald_necklace.jpg',
    tag: 'Signature Piece',
    spec: '14.1 ct Colombian Emeralds • 18K Gold',
    description: 'A cascading lariat necklace with faceted emerald briolettes terminating in double pavé diamond tassel drops.'
  },
  {
    id: 'prod-6',
    name: 'Archduchess Emerald Statement Plastron',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 45000,
    image: 'images/emerald_necklace.jpg',
    tag: 'Haute Joaillerie',
    spec: '42.0 ct Certified Emeralds • 18K Yellow Gold',
    description: 'Gala-worthy plastron bib necklace composed of hand-linked hexagonal emerald clusters and brilliant diamonds.'
  },
  {
    id: 'prod-7',
    name: 'Celeste Octagon Emerald Ribbon Necklace',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 21500,
    image: 'images/emerald_necklace.jpg',
    tag: 'Bespoke Cut',
    spec: '11.8 ct Octagon Emerald • Platinum Bezel',
    description: 'Modern architectural geometric pendant highlighting a luminous octagon-cut emerald framed in knife-edge platinum.'
  },
  {
    id: 'prod-8',
    name: 'Palatial Emerald Floral Garland Collier',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 33800,
    image: 'images/emerald_necklace.jpg',
    tag: 'Royal Heritage',
    spec: '22.6 ct Emerald Petals • 18K Solid Gold',
    description: 'Floral garland motifs sculpted from matched marquise diamonds and rich forest-green Colombian emeralds.'
  },
  {
    id: 'prod-9',
    name: 'Regal Empress Emerald Marquise Pendant',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 15200,
    image: 'images/emerald_necklace.jpg',
    tag: 'Single Origin',
    spec: '7.8 ct Colombian Marquise Emerald',
    description: 'An elongated marquise emerald accented with micro-pave diamond sunburst rays on an artisan cable chain.'
  },
  {
    id: 'prod-10',
    name: 'Dynasty Emerald & Freshwater Pearl Sautoir',
    category: 'emerald',
    categoryName: 'EMERALD COUTURE',
    price: 27900,
    image: 'images/emerald_necklace.jpg',
    tag: 'Collector Choice',
    spec: '16.5 ct Carved Emeralds • Natural Pearls',
    description: 'Vintage-inspired opera length sautoir alternating hand-carved floral emerald beads with luminous South Sea pearls.'
  },

  // ==========================================
  // VARIANT 2: ROYAL RINGS (10 items)
  // ==========================================
  {
    id: 'prod-11',
    name: 'Empress Emerald Cut Halo Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 8750,
    image: 'images/emerald_ring.jpg',
    tag: 'Bespoke Cut',
    spec: '3.2 ct Emerald Cut • 18K Yellow Gold',
    description: 'A striking emerald-cut solitaire stone cradled in a delicate diamond halo, set on a solid 18K yellow gold band with polished mirror finish.'
  },
  {
    id: 'prod-12',
    name: 'Royal Cushion Emerald Solitaire',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 11800,
    image: 'images/emerald_ring.jpg',
    tag: 'Single Origin',
    spec: '4.0 ct Cushion Emerald • Platinum 950',
    description: 'Sustainably mined Muzo emerald showcasing vivid green hue and high clarity, set in handcrafted Platinum 950 with hidden diamond bezel.'
  },
  {
    id: 'prod-13',
    name: 'Duchess Three-Stone Emerald & Diamond Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 14600,
    image: 'images/emerald_ring.jpg',
    tag: 'Royal Heritage',
    spec: '3.8 ct Emerald with 1.4 ct Trillion Diamonds',
    description: 'Classic trilogy ring symbolizing past, present, and future with a vibrant center emerald and brilliant side trillions.'
  },
  {
    id: 'prod-14',
    name: 'Sovereign Signet Emerald Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 7400,
    image: 'images/emerald_ring.jpg',
    tag: 'Artisan Solid',
    spec: '2.5 ct Flush Emerald • Heavy 18K Gold',
    description: 'Heavy masculine-feminine signet ring in brushed 18K gold featuring a flush-set flawless deep green emerald.'
  },
  {
    id: 'prod-15',
    name: 'Tiara Pavé Emerald Crown Band',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 5900,
    image: 'images/emerald_ring.jpg',
    tag: 'Bespoke Cut',
    spec: '1.9 ct Emerald Cuts • Micro-Pave Diamond Band',
    description: 'Curved contour tiara band crafted to nest effortlessly against engagement solitaires or worn as a royal statement.'
  },
  {
    id: 'prod-16',
    name: 'Imperial Oval Emerald Cocktail Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 16200,
    image: 'images/emerald_ring.jpg',
    tag: 'Masterpiece',
    spec: '5.6 ct Unheated Emerald • Double Diamond Halo',
    description: 'Dramatic cocktail ring with double row scalloped diamond frame elevating a magnificent 5.6 carat oval center gemstone.'
  },
  {
    id: 'prod-17',
    name: 'Eternity Radiant Emerald Band',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 9200,
    image: 'images/emerald_ring.jpg',
    tag: 'Signature Piece',
    spec: '4.8 ct Total Weight • Matched Step Cuts',
    description: 'Complete endless eternity band with twenty matched square emerald-cut natural stones set in shared prong platinum.'
  },
  {
    id: 'prod-18',
    name: 'Monarch Hexagonal Carved Gold Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 10500,
    image: 'images/emerald_ring.jpg',
    tag: 'Collector Choice',
    spec: '3.1 ct Hexagonal Emerald • 24K Hand Carved',
    description: 'Artisan carved band inspired by Mughal architecture with floral motifs framing a custom hexagonal cut emerald.'
  },
  {
    id: 'prod-19',
    name: 'Princess Pear-Cut Emerald Bypass Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 8300,
    image: 'images/emerald_ring.jpg',
    tag: 'Modern Royal',
    spec: '2.8 ct Pear Emerald • 1.2 ct Pear Diamond',
    description: 'Toi et Moi bypass silhouette pairing an electric green Colombian pear emerald with an exceptional VVS diamond.'
  },
  {
    id: 'prod-20',
    name: 'Baroness Art Deco Emerald Ring',
    category: 'rings',
    categoryName: 'ROYAL RINGS',
    price: 12900,
    image: 'images/emerald_ring.jpg',
    tag: 'Vintage Vault',
    spec: '3.5 ct Asscher Emerald • Onyx Inlay & Diamonds',
    description: '1920s Art Deco reproduction with stepped geometric black onyx borders highlighting an extraordinary Asscher emerald.'
  },

  // ==========================================
  // VARIANT 3: HIGH EARRINGS (10 items)
  // ==========================================
  {
    id: 'prod-21',
    name: 'Crown Teardrop Emerald Earrings',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 6400,
    image: 'images/emerald_earrings.jpg',
    tag: 'Signature Piece',
    spec: '4.5 ct Emerald Drops with Gold Leaf Clusters',
    description: 'Lavish chandelier dangle earrings featuring pear-shaped deep green emerald gemstones suspended from hand-sculpted gold leaf diamond clusters.'
  },
  {
    id: 'prod-22',
    name: 'Duchess Emerald Chandelier Earrings',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 7900,
    image: 'images/emerald_earrings.jpg',
    tag: 'Haute Joaillerie',
    spec: '5.2 ct Colombian Emeralds • 18K Gold',
    description: 'Statement drop earrings created for red carpet galas, catching ambient light with every step with radiant golden reflections.'
  },
  {
    id: 'prod-23',
    name: 'Royal Solitaire Emerald Studs',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 4800,
    image: 'images/emerald_earrings.jpg',
    tag: 'Timeless Classic',
    spec: '2.6 ct Matched Pair • 18K Yellow Gold Basket',
    description: 'Everyday elegance in four-prong martini settings that position the intense green emerald stones flat and secure on the ear.'
  },
  {
    id: 'prod-24',
    name: 'Palace Emerald Cascade Drop Earrings',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 11200,
    image: 'images/emerald_earrings.jpg',
    tag: 'Masterpiece',
    spec: '7.4 ct Graduated Drops • Diamond Halo',
    description: 'Three-tiered articulate drops with seamless jointing providing fluid, hypnotic kinetic movement.'
  },
  {
    id: 'prod-25',
    name: 'Empress Emerald Huggie Hoops',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 3600,
    image: 'images/emerald_earrings.jpg',
    tag: 'Everyday Luxury',
    spec: '1.8 ct Channel-Set Baguettes • 18K Solid Gold',
    description: 'Snug-fitting hinged huggies lined with channel-set emerald baguettes and polished solid gold rims.'
  },
  {
    id: 'prod-26',
    name: 'Marquise Wing Emerald Ear Climbers',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 5200,
    image: 'images/emerald_earrings.jpg',
    tag: 'Modern Royal',
    spec: '3.0 ct Marquise Emeralds • Pavé Diamonds',
    description: 'Graceful botanical climbers tracing the natural curve of the earlobe with graduated leaves of emerald and diamond.'
  },
  {
    id: 'prod-27',
    name: 'Versailles Diamond Halo Emerald Drops',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 9800,
    image: 'images/emerald_earrings.jpg',
    tag: 'Collector Choice',
    spec: '5.8 ct Cushion Emeralds • Platinum 950',
    description: 'Detachable drops featuring leverback huggie tops that can be worn alone as discreet daytime diamond earrings.'
  },
  {
    id: 'prod-28',
    name: 'Regal Filigree Emerald Ear Pendants',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 8400,
    image: 'images/emerald_earrings.jpg',
    tag: 'Artisan Solid',
    spec: '4.9 ct Oval Emeralds • 22K Granulated Gold',
    description: 'Hand-granulated Byzantine filigree gold work framing exceptional bright Colombian center stones.'
  },
  {
    id: 'prod-29',
    name: 'Astoria Geometric Emerald Drops',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 6900,
    image: 'images/emerald_earrings.jpg',
    tag: 'Bespoke Cut',
    spec: '3.6 ct Trapezoid Emeralds • 18K Gold',
    description: 'Clean modernist silhouette pairing trapezoid cut emeralds with linear baguette diamond suspenders.'
  },
  {
    id: 'prod-30',
    name: 'Opera Tassel Emerald Fringe Earrings',
    category: 'earrings',
    categoryName: 'HIGH EARRINGS',
    price: 13500,
    image: 'images/emerald_earrings.jpg',
    tag: 'Haute Joaillerie',
    spec: '8.2 ct Emerald Beads & Drops • 18K Gold',
    description: 'Dramatic shoulder-dusting gold chain fringes ending in polished emerald drops designed for high-profile galas.'
  },

  // ==========================================
  // VARIANT 4: BRACELETS & CUFFS (10 items)
  // ==========================================
  {
    id: 'prod-31',
    name: 'Verdant Palace Emerald Cuff Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 14200,
    image: 'images/emerald_necklace.jpg',
    tag: '24K Artisan Gold',
    spec: '12.0 ct Oval Emeralds • 24K Carved Gold',
    description: 'Hand-carved solid gold cuff bracelet inlaid with alternating oval Zambian emeralds and micro-pave white diamond stars.'
  },
  {
    id: 'prod-32',
    name: 'Sovereign Emerald Tennis Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 11500,
    image: 'images/emerald_necklace.jpg',
    tag: 'Signature Piece',
    spec: '8.5 ct Matched Emeralds • 18K White Gold',
    description: 'A seamless flexible line bracelet set with forty-eight precision-matched square emeralds with hidden safety clasp.'
  },
  {
    id: 'prod-33',
    name: 'Royal Bengal Open Bangle with Emerald Finials',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 15800,
    image: 'images/emerald_necklace.jpg',
    tag: 'Royal Heritage',
    spec: '6.4 ct Emerald Drops • 18K Solid Yellow Gold',
    description: 'Solid torque open bangle terminating in twin fluted emerald caps with pavé diamond collars.'
  },
  {
    id: 'prod-34',
    name: 'Constellation Emerald & Diamond Link Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 17900,
    image: 'images/emerald_necklace.jpg',
    tag: 'Masterpiece',
    spec: '10.2 ct Colombian Emeralds • 4.5 ct Diamonds',
    description: 'Interlocking oval links encrusted with round brilliant diamonds centered by bezel-set vivid emeralds.'
  },
  {
    id: 'prod-35',
    name: 'Empress Hinged Emerald Bangle',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 9400,
    image: 'images/emerald_necklace.jpg',
    tag: 'Everyday Luxury',
    spec: '4.2 ct Channel Emeralds • 18K Gold',
    description: 'Oval wrist-contoured hinged bangle with channel-set emeralds across the top and satin-finished solid gold back.'
  },
  {
    id: 'prod-36',
    name: 'Maharani Emerald Bead Multi-Strand Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 12600,
    image: 'images/emerald_necklace.jpg',
    tag: 'Collector Choice',
    spec: '28.0 ct Smooth Tumble Emeralds • Gold Bars',
    description: 'Five opulent strands of smooth Colombian emerald beads joined by diamond-set 18K yellow gold separator bars.'
  },
  {
    id: 'prod-37',
    name: 'Palazzo Wide Mesh Emerald Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 22000,
    image: 'images/emerald_necklace.jpg',
    tag: 'Haute Joaillerie',
    spec: '15.5 ct Cabochon Emeralds • Woven 18K Gold',
    description: 'Flexible Milanese gold mesh strap adorned with seven bezel-mounted high-dome natural cabochon emeralds.'
  },
  {
    id: 'prod-38',
    name: 'Crown Charm Emerald Chain Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 6800,
    image: 'images/emerald_necklace.jpg',
    tag: 'Bespoke Cut',
    spec: '3.4 ct Emerald Drops • Heavy Paperclip Link',
    description: 'Chunky modern paperclip chain suspended with three bezel-set emerald charms and diamond lock.'
  },
  {
    id: 'prod-39',
    name: 'Imperial Serpent Emerald Coil Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 18400,
    image: 'images/emerald_necklace.jpg',
    tag: 'Signature Piece',
    spec: '5.8 ct Emerald Eyes & Head • Flexible Tubogas',
    description: 'Flexible tubogas gold coil bracelet culminating in a stylized serpent head with vivid pear emerald eyes.'
  },
  {
    id: 'prod-40',
    name: 'Art Deco Emerald & Platinum Line Bracelet',
    category: 'bracelets',
    categoryName: 'BRACELETS & CUFFS',
    price: 16500,
    image: 'images/emerald_necklace.jpg',
    tag: 'Vintage Vault',
    spec: '7.8 ct French Cut Emeralds • Platinum 950',
    description: 'Finely milgrained antique line bracelet featuring rare calibré-cut emeralds and brilliant diamonds.'
  },

  // ==========================================
  // VARIANT 5: GOLD HERITAGE (10 items)
  // ==========================================
  {
    id: 'prod-41',
    name: 'The Jaipur Royal Heritage Kundan Choker',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 26800,
    image: 'images/emerald_necklace.jpg',
    tag: '24K Artisan Gold',
    spec: '35.0 ct Polki Emeralds • 24K Pure Foil Setting',
    description: 'Centuries-old royal Kundan Jadau craftsmanship in 24K pure gold with reverse Meenakari enamel painting and uncut gemstones.'
  },
  {
    id: 'prod-42',
    name: 'Mughal Arch Emerald Heritage Pendant',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 13400,
    image: 'images/emerald_necklace.jpg',
    tag: 'Heritage Gold',
    spec: '11.5 ct Carved Leaf Emerald • 22K Solid Gold',
    description: 'Hand-carved botanical floral emerald nestled within a trefoil arch of granulated 22K gold and pearl drop.'
  },
  {
    id: 'prod-43',
    name: 'Nizam Heritage Polki & Emerald Haar',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 36000,
    image: 'images/emerald_necklace.jpg',
    tag: 'Royal Heritage',
    spec: '45.0 ct Emerald Tumblers • Uncut Diamonds',
    description: 'Magnificent multi-layered royal haar worn by aristocracy, strung with matched emerald beads and polki medallions.'
  },
  {
    id: 'prod-44',
    name: 'Byzantine Hammered Gold Emerald Brooch',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 8900,
    image: 'images/emerald_necklace.jpg',
    tag: 'Collector Choice',
    spec: '6.2 ct Raw Crystal Emerald • 22K Hammered Gold',
    description: 'Textured ancient Mediterranean coin motif with an unheated raw crystal emerald specimen mounted as center jewel.'
  },
  {
    id: 'prod-45',
    name: 'Temple Arch Heritage Emerald Jhumkas',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 7600,
    image: 'images/emerald_earrings.jpg',
    tag: 'Artisan Solid',
    spec: '5.4 ct Emerald Drops • Handcrafted 22K Gold',
    description: 'Architectural temple bell jhumkas chiming with hanging emerald drops and tiny golden seed pearl clusters.'
  },
  {
    id: 'prod-46',
    name: 'Royal Heritage Emerald Navratna Kada',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 17200,
    image: 'images/emerald_necklace.jpg',
    tag: '24K Artisan Gold',
    spec: '14.0 ct Emerald Cabochons • Heavy Solid Gold',
    description: 'Solid elephant-head screw kada bracelet with deep green emerald inlays and traditional embossed filigree.'
  },
  {
    id: 'prod-47',
    name: 'Ancient Sun Wheel Heritage Medallion',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 10800,
    image: 'images/emerald_necklace.jpg',
    tag: 'Heritage Gold',
    spec: '4.8 ct Central Cabochon • 18K Antiqued Gold',
    description: 'Sunburst solar calendar talisman featuring a glowing cabochon emerald wrapped in sacred spiral engravings.'
  },
  {
    id: 'prod-48',
    name: 'Maharaja Heritage Turban Emerald Sarpech',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 41000,
    image: 'images/emerald_necklace.jpg',
    tag: 'Royal Heritage',
    spec: '32.0 ct Certified Muzo Emeralds • 22K Gold',
    description: 'Imperial royal feather-motif sarpech ornament wearable as an opulent gala brooch or statement royal pendant.'
  },
  {
    id: 'prod-49',
    name: 'Heritage Granulated Emerald Signet',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 8200,
    image: 'images/emerald_ring.jpg',
    tag: 'Artisan Solid',
    spec: '3.6 ct Sugarloaf Emerald • 22K Solid Gold',
    description: 'Intense sugarloaf cabochon emerald set in a museum-grade Etruscan granulated gold signet setting.'
  },
  {
    id: 'prod-50',
    name: 'Imperial Heritage Emerald Amulet Box',
    category: 'heritage',
    categoryName: 'GOLD HERITAGE',
    price: 19800,
    image: 'images/emerald_necklace.jpg',
    tag: 'Private Vault',
    spec: '8.9 ct Inlaid Emerald Plate • 24K Hand-Engraved',
    description: 'Functional miniature heirloom taweez prayer locket hand-chiseled from 24K gold with an inlaid carved emerald lid.'
  }
];

if (typeof window !== 'undefined') {
  window.SAMPLE_PRODUCTS = SAMPLE_PRODUCTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_PRODUCTS };
}
