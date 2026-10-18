/* ==========================================================================
   rsauraantitarnish - Node.js / Express + MongoDB Atlas Backend
   ========================================================================== */

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const QRCode     = require('qrcode');
const { DEFAULT_CATEGORIES } = require('./categories_data.js');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Ensure browsers don't hold onto stale cached HTML/JS/CSS
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname)));   // serve index.html, admin.html, css, js, images

// ── Clean Page Routes ────────────────────────────────────────────────────────
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/order-confirmation', (req, res) => res.sendFile(path.join(__dirname, 'order-confirmation.html')));
app.get('/review', (req, res) => res.sendFile(path.join(__dirname, 'review.html')));

// ── MongoDB connection ───────────────────────────────────────────────────────
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully.'))
    .catch(err => console.warn('⚠️ MongoDB Atlas connection warning (server will continue running with offline/local fallback):', err.message));
} else {
  console.warn('⚠️ MONGODB_URI not provided; server running in static/local-cache mode.');
}

// ── Schemas & Models ─────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  category:     { type: String, required: true },
  categoryName: { type: String },
  price:        { type: Number, required: true },
  image:        { type: String },
  tag:          { type: String },
  spec:         { type: String },
  description:  { type: String },
  stock:        { type: Number, default: 10 },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  id:              { type: String, required: true, unique: true },
  customer:        { type: String, required: true },
  phone:           { type: String },
  email:           { type: String },
  address:         { type: String },
  city:            { type: String },
  state:           { type: String },
  pincode:         { type: String },
  deliveryAddress: { type: String },
  paymentMethod:   { type: String, default: 'UPI / Online' },
  items:           { type: Array, default: [] },
  product:         { type: String, required: true },
  qty:             { type: Number, default: 1 },
  actualPrice:     { type: Number },
  sellingPrice:    { type: Number },
  deliveryCharge:  { type: Number, default: 0 },
  totalValue:      { type: Number },
  amount:          { type: Number, required: true },
  location:        { type: String },
  date:            { type: String },
  status:          { type: String, default: 'processing', enum: ['processing','shipped','delivered','cancelled'] },
}, { timestamps: true, strict: false });

const customerSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String },
  whatsapp: { type: String },
  location: { type: String },
  orders:   { type: Number, default: 0 },
  spent:    { type: Number, default: 0 },
  since:    { type: String },
  status:   { type: String, default: 'active', enum: ['vip','active','inactive'] },
}, { timestamps: true });

const appointmentSchema = new mongoose.Schema({
  client:   { type: String, required: true },
  email:    { type: String },
  salon:    { type: String },
  datetime: { type: String },
  status:   { type: String, default: 'pending', enum: ['pending','confirmed','cancelled'] },
}, { timestamps: true });

const newsletterSchema = new mongoose.Schema({
  email:  { type: String, required: true, unique: true },
  date:   { type: String },
  status: { type: String, default: 'active' },
}, { timestamps: true });

const settingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: String, required: true },
}, { timestamps: true });

const Product     = mongoose.model('Product',     productSchema);
const Order       = mongoose.model('Order',       orderSchema);
const Customer    = mongoose.model('Customer',    customerSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Newsletter  = mongoose.model('Newsletter',  newsletterSchema);
const Setting     = mongoose.model('Setting',     settingSchema);
const localSettingsCache = {};

// ── Seed helper (Clean baseline: no dummy data seeded) ───────────────────────
async function seedIfEmpty() {
  // Database is production/live; no dummy records are automatically seeded.
}
mongoose.connection.once('open', seedIfEmpty);

// ── API Routes ────────────────────────────────────────────────────────────────

/* ---------- PRODUCTS ---------- */
app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({}, '-__v -createdAt -updatedAt').lean();
      return res.json(products);
    }
  } catch (e) {
    console.warn('Could not read products from MongoDB:', e.message);
  }

  // Graceful fallback if MongoDB is temporarily down/disconnected
  try {
    const seedProducts = require('./seed_data.js').products;
    return res.json(seedProducts || []);
  } catch (err) {
    res.status(500).json({ error: 'Could not load products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.body.id },
      req.body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, product });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- PRODUCT CATEGORIES ---------- */
const categorySettingKey = 'product_categories';

function parseCategories(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') throw new Error('Stored product categories are invalid.');
  const categories = JSON.parse(value);
  if (!Array.isArray(categories)) throw new Error('Stored product categories are invalid.');
  return categories;
}

app.get('/api/categories', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOne({ key: categorySettingKey }).lean();
      if (setting) {
        localSettingsCache[categorySettingKey] = setting.value;
        return res.json(parseCategories(setting.value));
      }
    }
    const cached = localSettingsCache[categorySettingKey];
    return res.json(cached ? parseCategories(cached) : DEFAULT_CATEGORIES);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const label = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!label || label.length > 60 || !/^[A-Za-z0-9][A-Za-z0-9 &'-]*$/.test(label)) {
      return res.status(400).json({ error: 'Enter a category name using letters, numbers, spaces, apostrophes, hyphens, or ampersands (up to 60 characters).' });
    }

    const id = label.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let categories;
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOne({ key: categorySettingKey }).lean();
      if (setting) {
        localSettingsCache[categorySettingKey] = setting.value;
        categories = parseCategories(setting.value);
      } else {
        categories = [...DEFAULT_CATEGORIES];
      }
    } else {
      const cached = localSettingsCache[categorySettingKey];
      categories = cached ? parseCategories(cached) : [...DEFAULT_CATEGORIES];
    }

    if (categories.some(category => category.id === id || category.label.toLowerCase() === label.toLowerCase())) {
      return res.status(409).json({ error: 'That category already exists.' });
    }

    categories.push({ id, label });
    const value = JSON.stringify(categories);
    if (mongoose.connection.readyState === 1) {
      await Setting.findOneAndUpdate(
        { key: categorySettingKey },
        { key: categorySettingKey, value },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    localSettingsCache[categorySettingKey] = value;
    return res.status(201).json({ success: true, categories });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/* ---------- ORDERS ---------- */
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({}, '-_id -__v -createdAt -updatedAt').sort({ date: -1 }).lean();
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- CUSTOMERS ---------- */
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find({}, '-__v -createdAt -updatedAt').sort({ createdAt: -1 }).lean();
    res.json(customers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/customers', async (req, res) => {
  try {
    const existing = await Customer.findOne({
      $or: [{ whatsapp: req.body.whatsapp }, { email: req.body.email }]
    });
    if (existing) return res.json({ success: true, customer: existing, existed: true });
    const customer = await Customer.create(req.body);
    res.json({ success: true, customer });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- APPOINTMENTS ---------- */
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({}, '-__v -createdAt -updatedAt').sort({ datetime: 1 }).lean();
    res.json(appointments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appt = await Appointment.create(req.body);
    res.json({ success: true, appointment: appt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true, appointment: appt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- NEWSLETTER ---------- */
app.get('/api/newsletter', async (req, res) => {
  try {
    const subs = await Newsletter.find({}, '-__v -createdAt -updatedAt').sort({ date: -1 }).lean();
    res.json(subs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/newsletter', async (req, res) => {
  try {
    const sub = await Newsletter.findOneAndUpdate(
      { email: req.body.email },
      { email: req.body.email, date: req.body.date || new Date().toISOString().split('T')[0], status: 'active' },
      { upsert: true, new: true }
    );
    res.json({ success: true, subscriber: sub });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/newsletter/:email', async (req, res) => {
  try {
    await Newsletter.findOneAndDelete({ email: decodeURIComponent(req.params.email) });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- QR CODE GENERATION ---------- */
app.get('/api/qr', async (req, res) => {
  try {
    const targetUrl = req.query.url || `http://localhost:${PORT}/review.html`;
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#03140e',
        light: '#f5e6aa'
      }
    });
    res.json({ success: true, qr: qrDataUrl, url: targetUrl });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---------- SETTINGS (HERO IMAGE & STORE PREFERENCES) ---------- */
app.get('/api/settings/:key', async (req, res) => {
  try {
    const key = req.params.key;
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOne({ key }).lean();
      if (setting) {
        localSettingsCache[key] = setting.value;
        return res.json({ success: true, key, value: setting.value });
      }
    }
    return res.json({ success: true, key, value: localSettingsCache[key] || null });
  } catch (e) {
    res.status(500).json({ error: e.message, value: localSettingsCache[req.params.key] || null });
  }
});

app.post('/api/settings/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const { value } = req.body;
    localSettingsCache[key] = value;
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.json({ success: true, setting });
    }
    res.json({ success: true, setting: { key, value } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/settings/:key', async (req, res) => {
  try {
    const key = req.params.key;
    delete localSettingsCache[key];
    if (mongoose.connection.readyState === 1) {
      await Setting.findOneAndDelete({ key });
    }
    res.json({ success: true, message: `Setting ${key} cleared` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 RS Aura Jewel Server running at http://localhost:${PORT}`);
  console.log(`📱 Review page: http://localhost:${PORT}/review.html`);
});
