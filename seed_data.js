// seed_data.js – Initial data mirroring products_data.js and admin.js defaults
// Used by server.js to populate MongoDB on first run.

const { SAMPLE_PRODUCTS } = require('./products_data.js');

const products = SAMPLE_PRODUCTS;

const orders = [
  { id: '#SAN-2026-001', customer: 'Lady Victoria Rothschild',   product: 'The Sovereign Royal Emerald Necklace',  amount: 700,  location: 'Geneva, CH',    date: '2026-09-25', status: 'delivered'  },
  { id: '#SAN-2026-002', customer: 'Prince Karim Al-Rashid',     product: 'Royal Cushion Emerald Solitaire',       amount: 470,  location: 'Dubai, UAE',    date: '2026-09-24', status: 'shipped'    },
  { id: '#SAN-2026-003', customer: 'Ms. Evelyn Hargrove',        product: 'Empress Emerald Cut Halo Ring',         amount: 485,  location: 'New York, US',  date: '2026-09-24', status: 'processing' },
  { id: '#SAN-2026-004', customer: 'Mrs. Aisha Okonkwo',         product: 'Crown Teardrop Emerald Earrings',      amount: 355,  location: 'London, UK',    date: '2026-09-23', status: 'processing' },
  { id: '#SAN-2026-005', customer: 'Maharani Sushila Rao',       product: 'Verdant Palace Emerald Bracelet',      amount: 570,  location: 'Jaipur, IN',    date: '2026-09-22', status: 'delivered'  },
  { id: '#SAN-2026-006', customer: 'Dr. Camille Fontaine',       product: 'Duchess Emerald Chandelier Earrings',  amount: 440,  location: 'Paris, FR',     date: '2026-09-21', status: 'cancelled'  },
  { id: '#SAN-2026-007', customer: 'Lady Helena Weston',         product: 'The Sovereign Royal Emerald Necklace', amount: 700,  location: 'Edinburgh, UK', date: '2026-09-20', status: 'shipped'    },
  { id: '#SAN-2026-008', customer: 'Ms. Sofia Andreessen',       product: 'Empress Emerald Cut Halo Ring',        amount: 485,  location: 'Stockholm, SE', date: '2026-09-19', status: 'delivered'  },
];

const customers = [
  { name: 'Lady Victoria Rothschild', email: 'v.rothschild@noble.ch',       whatsapp: '+41 79 123 4567',    location: 'Geneva, CH',    orders: 4, spent: 68900, since: '2024-03', status: 'vip'      },
  { name: 'Prince Karim Al-Rashid',   email: 'karim@rashid-palace.ae',      whatsapp: '+971 50 987 6543',  location: 'Dubai, UAE',    orders: 3, spent: 45300, since: '2024-06', status: 'vip'      },
  { name: 'Ms. Evelyn Hargrove',      email: 'evelyn@sinclair.com',          whatsapp: '+1 212 555 0192',   location: 'New York, US',  orders: 2, spent: 17500, since: '2025-01', status: 'active'   },
  { name: 'Mrs. Aisha Okonkwo',       email: 'a.okonkwo@royalgroup.uk',      whatsapp: '+44 7700 900123',   location: 'London, UK',    orders: 1, spent: 6400,  since: '2025-08', status: 'active'   },
  { name: 'Maharani Sushila Rao',     email: 'sushila@raopalace.in',         whatsapp: '+91 98290 12345',   location: 'Jaipur, IN',    orders: 5, spent: 89200, since: '2023-11', status: 'vip'      },
  { name: 'Dr. Camille Fontaine',     email: 'c.fontaine@fontaine.fr',       whatsapp: '+33 6 12 34 56 78', location: 'Paris, FR',     orders: 1, spent: 0,     since: '2026-07', status: 'inactive' },
];

const appointments = [
  { client: 'Lady Helena Weston',       email: 'h.weston@noble.co.uk',        salon: 'Geneva Flagship Salon',       datetime: '2026-10-02 14:00', status: 'confirmed' },
  { client: 'Mr. Antoine Beaumont',     email: 'a.beaumont@atelier.fr',       salon: 'Virtual Live Consultation',   datetime: '2026-10-03 10:30', status: 'pending'   },
  { client: 'Princess Noor Al-Hamdan', email: 'noor@alhamdan.ae',             salon: 'New York Boutique',           datetime: '2026-10-05 16:00', status: 'pending'   },
  { client: 'Mrs. Rajni Kapoor',        email: 'rajni@kapoorhomes.in',         salon: 'Jaipur Heritage Palace',      datetime: '2026-10-06 11:00', status: 'confirmed' },
  { client: 'Ms. Chiara Romano',        email: 'c.romano@milanstyle.it',       salon: 'Virtual Live Consultation',   datetime: '2026-09-28 09:00', status: 'pending'   },
];

const newsletter = [
  { email: 'victoria@rothschild.ch',  date: '2026-08-15', status: 'active' },
  { email: 'evelyn@sinclair.com',     date: '2026-08-20', status: 'active' },
  { email: 'noor@alhamdan.ae',        date: '2026-09-01', status: 'active' },
  { email: 'sushila@raopalace.in',    date: '2026-07-11', status: 'active' },
  { email: 'chiara@milanstyle.it',    date: '2026-09-14', status: 'active' },
  { email: 'h.weston@noble.co.uk',   date: '2026-09-18', status: 'active' },
];

module.exports = { products, orders, customers, appointments, newsletter };
