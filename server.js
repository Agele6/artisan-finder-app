const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const VALID_TRADES = new Set([
  'electrician', 'plumber', 'carpenter', 'welder', 'tailor',
  'mechanic', 'ac_gen', 'painter', 'mason', 'electronics'
]);
const VALID_STATUSES = new Set(['pending', 'confirmed', 'declined', 'completed']);

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

// ---------- Artisans ----------

// GET /api/artisans?trade=&area=&q=  — list/search artisans
app.get('/api/artisans', (req, res) => {
  const { trade, area, q } = req.query;
  let sql = 'SELECT * FROM artisans WHERE 1=1';
  const params = [];

  if (trade) {
    sql += ' AND trade = ?';
    params.push(trade);
  }
  if (area) {
    sql += ' AND area = ?';
    params.push(area);
  }
  if (q) {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(trade) LIKE ?)';
    const like = `%${q.toLowerCase()}%`;
    params.push(like, like);
  }
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /api/artisans/:id — single artisan profile
app.get('/api/artisans/:id', (req, res) => {
  const artisan = db.prepare('SELECT * FROM artisans WHERE id = ?').get(req.params.id);
  if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
  res.json(artisan);
});

// POST /api/artisans — register a new artisan profile
app.post('/api/artisans', (req, res) => {
  const { name, trade, area, phone, whatsapp, years_experience, bio } = req.body || {};

  if (!name || !trade || !area || !phone) {
    return badRequest(res, 'name, trade, area and phone are required.');
  }
  if (!VALID_TRADES.has(trade)) {
    return badRequest(res, `trade must be one of: ${[...VALID_TRADES].join(', ')}`);
  }

  const result = db.prepare(`
    INSERT INTO artisans (name, trade, area, phone, whatsapp, years_experience, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    String(name).trim(),
    trade,
    String(area).trim(),
    String(phone).trim(),
    whatsapp ? String(whatsapp).trim() : String(phone).trim(),
    Number.isFinite(Number(years_experience)) ? Number(years_experience) : 0,
    bio ? String(bio).trim() : ''
  );

  const created = db.prepare('SELECT * FROM artisans WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// ---------- Bookings ----------

// POST /api/bookings — a customer requests to book an artisan
app.post('/api/bookings', (req, res) => {
  const { artisan_id, customer_name, customer_phone, preferred_date, job_description } = req.body || {};

  if (!artisan_id || !customer_name || !customer_phone || !preferred_date) {
    return badRequest(res, 'artisan_id, customer_name, customer_phone and preferred_date are required.');
  }

  const artisan = db.prepare('SELECT id FROM artisans WHERE id = ?').get(artisan_id);
  if (!artisan) return badRequest(res, 'That artisan does not exist.');

  const result = db.prepare(`
    INSERT INTO bookings (artisan_id, customer_name, customer_phone, preferred_date, job_description, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(
    artisan_id,
    String(customer_name).trim(),
    String(customer_phone).trim(),
    String(preferred_date).trim(),
    job_description ? String(job_description).trim() : ''
  );

  const created = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// GET /api/bookings/mine?phone=+234...  — an artisan looks up bookings made against their own phone number
app.get('/api/bookings/mine', (req, res) => {
  const { phone } = req.query;
  if (!phone) return badRequest(res, 'phone query parameter is required.');

  const artisan = db.prepare('SELECT * FROM artisans WHERE phone = ?').get(String(phone).trim());
  if (!artisan) return res.status(404).json({ error: 'No artisan profile is registered with that phone number.' });

  const bookings = db.prepare(`
    SELECT * FROM bookings WHERE artisan_id = ? ORDER BY created_at DESC
  `).all(artisan.id);

  res.json({ artisan, bookings });
});

// GET /api/bookings/:id — booking status lookup (for a customer to check their request)
app.get('/api/bookings/:id', (req, res) => {
  const booking = db.prepare(`
    SELECT b.*, a.name AS artisan_name, a.trade AS artisan_trade, a.phone AS artisan_phone
    FROM bookings b JOIN artisans a ON a.id = b.artisan_id
    WHERE b.id = ?
  `).get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

// PATCH /api/bookings/:id — artisan confirms/declines/completes a booking
app.patch('/api/bookings/:id', (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.has(status)) {
    return badRequest(res, `status must be one of: ${[...VALID_STATUSES].join(', ')}`);
  }

  const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Booking not found' });

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Fallback to the SPA for any non-API route (Express 5 wildcard syntax)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Artisan Finder running at http://localhost:${PORT}`);
});
