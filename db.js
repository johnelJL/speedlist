const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

      sqliteDB.run('ALTER TABLE ads ADD COLUMN images TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add images column to ads table:', err.message);
        }
      });

      sqliteDB.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
      );
    });
    return;
  }

  // JSON fallback: ensure file exists
  if (!fs.existsSync(jsonFile)) {
    fs.writeFileSync(jsonFile, JSON.stringify({ ads: [], users: [] }, null, 2));
  } else {
    const current = _readJson();
    current.ads = (current.ads || []).map((ad) => ({ ...ad, images: Array.isArray(ad.images) ? ad.images : [] }));
    current.users = current.users || [];
    _writeJson(current);
  }
}

function _readJson() {
  const raw = fs.readFileSync(jsonFile, 'utf8');
  return JSON.parse(raw);
}

function _writeJson(obj) {
  fs.writeFileSync(jsonFile, JSON.stringify(obj, null, 2));
}

function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash, salt, ...rest } = row;
  return rest;
}

function randomFrom(list) {
  if (!Array.isArray(list) || !list.length) return '';
  return list[Math.floor(Math.random() * list.length)];
}

function buildRandomAd(category, subcategories) {
  const adjectives = ['Quality', 'Gently Used', 'Brand New', 'Limited Edition', 'Affordable', 'Premium', 'Reliable', 'Stylish'];
  const hooks = ['Great deal', 'Must see', 'Priced to sell', 'Ready for pickup', 'Well maintained', 'With extras included'];
  const cities = ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Ioannina', 'Rhodes'];
  const subcategory = randomFrom(subcategories || []) || category;

  const title = `${randomFrom(adjectives)} ${subcategory}`;
  const description = `${randomFrom(hooks)}. ${subcategory} in excellent condition. Contact for details.`;
  const price = Math.floor(Math.random() * 5000) + 10;

  return {
    title,
    description,
    category,
    location: randomFrom(cities),
    price,
    images: []
  };
}

function parseImagesField(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function normalizeAdRow(row) {
  if (!row) return null;
  return {
    ...row,
    images: parseImagesField(row.images)
  };
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
}

function createAd(ad) {
  const images = Array.isArray(ad.images) ? ad.images.slice(0, 4) : [];

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const stmt = `INSERT INTO ads (title, description, category, location, price, images) VALUES (?, ?, ?, ?, ?, ?)`;
      sqliteDB.run(
        stmt,
        [ad.title, ad.description, ad.category || '', ad.location || '', ad.price ?? null, JSON.stringify(images)],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            title: ad.title,
            description: ad.description,
            category: ad.category || '',
            location: ad.location || '',
            price: ad.price ?? null,
            created_at: new Date().toISOString(),
            images
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
      created_at: new Date().toISOString(),
      images
    };
    store.ads.push(newAd);
    _writeJson(store);
    resolve(newAd);
  });
}

function countAdsForCategory(category) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.get(`SELECT COUNT(*) as count FROM ads WHERE category = ?`, [category], (err, row) => {
        if (err) return reject(err);
        resolve(row?.count || 0);
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    resolve(store.ads.filter((a) => a.category === category).length);
  });
}

async function seedAdsForCategories(categoriesList, targetPerCategory = 30) {
  if (!Array.isArray(categoriesList) || !categoriesList.length) return 0;

  let created = 0;

  for (const cat of categoriesList) {
    const existing = await countAdsForCategory(cat.name);
    const needed = Math.max(0, targetPerCategory - existing);

    for (let i = 0; i < needed; i += 1) {
      const ad = buildRandomAd(cat.name, cat.subcategories);
      await createAd(ad);
      created += 1;
    }
  }

  return created;
}

function getRecentAds(limit = 10) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.all(
        `SELECT * FROM ads ORDER BY datetime(created_at) DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map(normalizeAdRow));
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
    resolve(rows.map((row) => normalizeAdRow(row)));
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
        resolve(rows.map(normalizeAdRow));
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
    resolve(results.map((row) => normalizeAdRow(row)));
  });
}

function getAdById(id) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.get(`SELECT * FROM ads WHERE id = ?`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(normalizeAdRow(row));
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const row = store.ads.find((ad) => ad.id === id);
    resolve(normalizeAdRow(row));
  });
}

function registerUser({ email, password }) {
  if (!email || !password) {
    return Promise.reject(new Error('Email and password are required'));
  }

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const stmt = `INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)`;

      sqliteDB.run(stmt, [email.toLowerCase(), passwordHash, salt], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return reject(new Error('Email already registered'));
          }
          return reject(err);
        }

        sqliteDB.get(`SELECT id, email, created_at FROM users WHERE id = ?`, [this.lastID], (getErr, row) => {
          if (getErr) return reject(getErr);
          resolve(row);
        });
      });
    });
  }

  return new Promise((resolve, reject) => {
    const store = _readJson();
    const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return reject(new Error('Email already registered'));
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const nextId = (store.users.length ? Math.max(...store.users.map((u) => u.id)) : 0) + 1;
    const user = { id: nextId, email: email.toLowerCase(), password_hash: passwordHash, salt, created_at: new Date().toISOString() };
    store.users.push(user);
    _writeJson(store);
    resolve(sanitizeUser(user));
  });
}

function loginUser({ email, password }) {
  if (!email || !password) {
    return Promise.reject(new Error('Email and password are required'));
  }

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase()], (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Invalid email or password'));

        const expected = hashPassword(password, row.salt);
        if (expected !== row.password_hash) {
          return reject(new Error('Invalid email or password'));
        }

        resolve(sanitizeUser(row));
      });
    });
  }

  return new Promise((resolve, reject) => {
    const store = _readJson();
    const row = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!row) return reject(new Error('Invalid email or password'));
    const expected = hashPassword(password, row.salt);
    if (expected !== row.password_hash) return reject(new Error('Invalid email or password'));
    resolve(sanitizeUser(row));
  });
}

module.exports = {
  init,
  createAd,
  getRecentAds,
  searchAds,
  getAdById,
  registerUser,
  loginUser,
  seedAdsForCategories
};
