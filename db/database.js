const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'artisan-finder.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

const dbExisted = fs.existsSync(DB_PATH);
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Always safe to run — uses CREATE TABLE IF NOT EXISTS
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// Seed sample artisans only on first run (empty table), so re-starting the
// server never duplicates data or wipes real registrations/bookings.
const artisanCount = db.prepare('SELECT COUNT(*) AS n FROM artisans').get().n;

if (artisanCount === 0) {
  const SEED = require('./seed');
  const insert = db.prepare(`
    INSERT INTO artisans (name, trade, area, phone, whatsapp, years_experience, bio)
    VALUES (@name, @trade, @area, @phone, @whatsapp, @years_experience, @bio)
  `);
  db.exec('BEGIN');
  try {
    for (const row of SEED) insert.run(row);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  console.log(`Seeded ${SEED.length} sample artisans (first run).`);
}

if (!dbExisted) {
  console.log(`New database created at ${DB_PATH}`);
}

module.exports = db;
