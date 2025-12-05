const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'speedlist.db');
const jsonFile = path.join(__dirname, 'speedlist.json');

let useSqlite = false;
let sqliteDB = null;

try {
  // Try to require sqlite3; if it's not installed or failed to build, fall back
  const sqlite3 = require('sqlite3').verbose();
  sqliteDB = new sqlite3.Database(dbFile);
  useSqlite = true;
} catch (err) {
  // sqlite3 not available — we'll use a simple JSON-file backed fallback
  useSqlite = false;
}

function init() {
  if (useSqlite) {
    sqliteDB.serialize(() => {
      sqliteDB.run(
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
    return;
  }

  // JSON fallback: ensure file exists
  if (!fs.existsSync(jsonFile)) {
    fs.writeFileSync(jsonFile, JSON.stringify({ ads: [] }, null, 2));
  }
}

function _readJson() {
  const raw = fs.readFileSync(jsonFile, 'utf8');
  return JSON.parse(raw);
}

function _writeJson(obj) {
  fs.writeFileSync(jsonFile, JSON.stringify(obj, null, 2));
}

function createAd(ad) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const stmt = `INSERT INTO ads (title, description, category, location, price) VALUES (?, ?, ?, ?, ?)`;
      sqliteDB.run(
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

  return new Promise((resolve) => {
    const store = _readJson();
    const nextId = (store.ads.length ? Math.max(...store.ads.map(a => a.id)) : 0) + 1;
    const newAd = {
      id: nextId,
      title: ad.title,
      description: ad.description,
      category: ad.category || '',
      location: ad.location || '',
      price: ad.price ?? null,
      created_at: new Date().toISOString()
    };
    store.ads.push(newAd);
    _writeJson(store);
    resolve(newAd);
  });
}

function getRecentAds(limit = 10) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.all(
        `SELECT * FROM ads ORDER BY datetime(created_at) DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const rows = store.ads
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
    resolve(rows);
  });
}

function searchAds(filters) {
  if (useSqlite) {
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

      sqliteDB.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    let results = store.ads.slice();

    if (filters.keywords) {
      const kw = filters.keywords.toLowerCase();
      results = results.filter(a => (a.title || '').toLowerCase().includes(kw) || (a.description || '').toLowerCase().includes(kw));
    }

    if (filters.category) {
      const cat = filters.category.toLowerCase();
      results = results.filter(a => (a.category || '').toLowerCase().includes(cat));
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(a => (a.location || '').toLowerCase().includes(loc));
    }

    if (filters.min_price != null) {
      results = results.filter(a => a.price != null && a.price >= filters.min_price);
    }

    if (filters.max_price != null) {
      results = results.filter(a => a.price != null && a.price <= filters.max_price);
    }

    results = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
    resolve(results);
  });
}

module.exports = {
  init,
  createAd,
  getRecentAds,
  searchAds
};
