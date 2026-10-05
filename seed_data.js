const { SAMPLE_PRODUCTS } = require('./products_data.js');

const products = SAMPLE_PRODUCTS;

const orders = [
  { id: '#SAN-2026-001', customer: 'Lady Victoria Rothschild',   product: 'Whimsical Charm Layered Necklace',  amount: 1250,  location: 'Geneva, CH',    date: '2026-09-25', status: 'delivered'  },
  { id: '#SAN-2026-002', customer: 'Prince Karim Al-Rashid',     product: 'Blush Bow Snake Chain Pendant',       amount: 850,  location: 'Dubai, UAE',    date: '2026-09-24', status: 'shipped'    },
  { id: '#SAN-2026-003', customer: 'Ms. Evelyn Hargrove',        product: 'Clover & Heart Layered Diamond Necklace',         amount: 1800,  location: 'New York, US',  date: '2026-09-24', status: 'processing' },
  { id: '#SAN-2026-004', customer: 'Mrs. Aisha Okonkwo',         product: 'Celestial Moon & Emerald Hearts Necklace',      amount: 2100,  location: 'London, UK',    date: '2026-09-23', status: 'processing' },
  { id: '#SAN-2026-005', customer: 'Maharani Sushila Rao',       product: 'Classic Herringbone & Beaded Double Chain',      amount: 950,  location: 'Jaipur, IN',    date: '2026-09-22', status: 'delivered'  }
];

const customers = [
  { name: 'Lady Victoria Rothschild', email: 'v.rothschild@noble.ch',       whatsapp: '+41 79 123 4567',    location: 'Geneva, CH',    orders: 1, spent: 1250, since: '2024-03', status: 'vip'      },
  { name: 'Prince Karim Al-Rashid',   email: 'karim@rashid-palace.ae',      whatsapp: '+971 50 987 6543',  location: 'Dubai, UAE',    orders: 1, spent: 850, since: '2024-06', status: 'vip'      },
  { name: 'Ms. Evelyn Hargrove',      email: 'evelyn@sinclair.com',          whatsapp: '+1 212 555 0192',   location: 'New York, US',  orders: 1, spent: 1800, since: '2025-01', status: 'active'   },
  { name: 'Mrs. Aisha Okonkwo',       email: 'a.okonkwo@royalgroup.uk',      whatsapp: '+44 7700 900123',   location: 'London, UK',    orders: 1, spent: 2100,  since: '2025-08', status: 'active'   },
  { name: 'Maharani Sushila Rao',     email: 'sushila@raopalace.in',         whatsapp: '+91 98290 12345',   location: 'Jaipur, IN',    orders: 1, spent: 950, since: '2023-11', status: 'vip'      },
  { name: 'Dr. Camille Fontaine',     email: 'c.fontaine@fontaine.fr',       whatsapp: '+33 6 12 34 56 78', location: 'Paris, FR',     orders: 0, spent: 0,     since: '2026-07', status: 'inactive' },
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
  { email: 'c.fontaine@fontaine.fr',  date: '2026-08-30', status: 'inactive' },
];

module.exports = { products, orders, customers, appointments, newsletter };
