-- Artisan Finder database schema (SQLite)

CREATE TABLE IF NOT EXISTS artisans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  trade TEXT NOT NULL,
  area TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artisan_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  job_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | declined | completed
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_artisans_trade ON artisans(trade);
CREATE INDEX IF NOT EXISTS idx_artisans_area ON artisans(area);
CREATE INDEX IF NOT EXISTS idx_bookings_artisan ON bookings(artisan_id);
