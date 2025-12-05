const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'speedlist.db');
const db = new sqlite3.Database(dbPath);

function init() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS ads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT,
          location TEXT,
          price REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    );
  });
}

function createAd(ad) {
  return new Promise((resolve, reject) => {
    const stmt = `INSERT INTO ads (title, description, category, location, price) VALUES (?, ?, ?, ?, ?)`;
    db.run(
      stmt,
      [ad.title, ad.description, ad.category || '', ad.location || '', ad.price ?? null],
      function (err) {
        if (err) return reject(err);
        resolve({
          id: this.lastID,
          title: ad.title,
          description: ad.description,
          category: ad.category || '',
          location: ad.location || '',
          price: ad.price ?? null,
          created_at: new Date().toISOString()
        });
      }
    );
  });
}

function getRecentAds(limit = 10) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ads ORDER BY datetime(created_at) DESC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

function searchAds(filters) {
  return new Promise((resolve, reject) => {
    const clauses = [];
    const params = [];

    if (filters.keywords) {
      clauses.push('(title LIKE ? OR description LIKE ?)');
      const term = `%${filters.keywords}%`;
      params.push(term, term);
    }

    if (filters.category) {
      clauses.push('category LIKE ?');
      params.push(`%${filters.category}%`);
    }

    if (filters.location) {
      clauses.push('location LIKE ?');
      params.push(`%${filters.location}%`);
    }

    if (filters.min_price != null) {
      clauses.push('price >= ?');
      params.push(filters.min_price);
    }

    if (filters.max_price != null) {
      clauses.push('price <= ?');
      params.push(filters.max_price);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const query = `SELECT * FROM ads ${where} ORDER BY datetime(created_at) DESC LIMIT 50`;

    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  init,
  createAd,
  getRecentAds,
  searchAds
};
