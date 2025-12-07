const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbFile = path.join(__dirname, 'speedlist.db');
const jsonFile = path.join(__dirname, 'speedlist.json');

const SUPPORTED_LANGS = ['en', 'el'];

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
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            title_en TEXT,
            title_el TEXT,
            description_en TEXT,
            description_el TEXT,
            category_en TEXT,
            category_el TEXT,
            location_en TEXT,
            location_el TEXT,
            source_language TEXT
          )`
      );

      sqliteDB.run('ALTER TABLE ads ADD COLUMN images TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add images column to ads table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE ads ADD COLUMN tags TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add tags column to ads table:', err.message);
        }
      });

      const langColumns = [
        'title_en',
        'title_el',
        'description_en',
        'description_el',
        'category_en',
        'category_el',
        'location_en',
        'location_el',
        'source_language'
      ];

      langColumns.forEach((column) => {
        sqliteDB.run(`ALTER TABLE ads ADD COLUMN ${column} TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.warn(`Could not add ${column} column to ads table:`, err.message);
          }
        });
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
    current.ads = (current.ads || []).map((ad) => {
      const titleEn = ad.title_en || ad.title || '';
      const titleEl = ad.title_el || ad.title || '';
      const descriptionEn = ad.description_en || ad.description || '';
      const descriptionEl = ad.description_el || ad.description || '';
      const categoryEn = ad.category_en || ad.category || '';
      const categoryEl = ad.category_el || ad.category || '';
      const locationEn = ad.location_en || ad.location || '';
      const locationEl = ad.location_el || ad.location || '';

      return {
        ...ad,
        title_en: titleEn,
        title_el: titleEl,
        description_en: descriptionEn,
        description_el: descriptionEl,
        category_en: categoryEn,
        category_el: categoryEl,
        location_en: locationEn,
        location_el: locationEl,
        source_language: SUPPORTED_LANGS.includes(ad.source_language) ? ad.source_language : 'en',
        images: Array.isArray(ad.images) ? ad.images : [],
        tags: Array.isArray(ad.tags) ? ad.tags : []
      };
    });
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
  const adjectives = ['Ποιοτικό', 'Σαν καινούργιο', 'Καινούργιο', 'Περιορισμένη διαθεσιμότητα', 'Οικονομική επιλογή', 'Premium', 'Αξιόπιστο', 'Μοντέρνο'];
  const hooks = [
    'Μεγάλη ευκαιρία',
    'Πρέπει να το δείτε',
    'Τιμή για άμεση πώληση',
    'Έτοιμο για παράδοση',
    'Καλοσυντηρημένο',
    'Με επιπλέον παροχές'
  ];
  const cities = ['Αθήνα', 'Θεσσαλονίκη', 'Πάτρα', 'Ηράκλειο', 'Λάρισα', 'Βόλος', 'Ιωάννινα', 'Ρόδος'];
  const subcategory = randomFrom(subcategories || []) || category;

  const title = `${randomFrom(adjectives)} ${subcategory}`;
  const description = `${randomFrom(hooks)}. ${subcategory} σε εξαιρετική κατάσταση. Επικοινωνήστε για λεπτομέρειες.`;
  const price = Math.floor(Math.random() * 5000) + 20;

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

function parseTagsField(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function ensureTags(ad, provided = []) {
  const cleaned = Array.isArray(provided)
    ? provided
        .map((tag) => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
        .filter(Boolean)
    : [];

  const stopwords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'for',
    'with',
    'without',
    'of',
    'to',
    'in',
    'on',
    'at',
    'by',
    'from',
    'this',
    'that',
    'is',
    'are',
    'was',
    'were',
    'it',
    'its',
    'my',
    'your',
    'our',
    'their',
    'το',
    'η',
    'ο',
    'και',
    'ή',
    'για',
    'με',
    'χωρις',
    'του',
    'της',
    'στο',
    'στα',
    'στη',
    'στην',
    'σε',
    'ενα',
    'ενας',
    'μια',
    'που'
  ]);

  const push = (value) => {
    const tag = (value || '').toString().trim().toLowerCase();
    if (tag && !cleaned.includes(tag) && !stopwords.has(tag)) {
      cleaned.push(tag);
    }
  };

  const tokenize = (value) =>
    (value || '')
      .toString()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => token.length > 2 && !stopwords.has(token));

  push(ad.category);
  push(ad.location);
  tokenize(ad.title).forEach(push);
  tokenize(ad.description).forEach(push);

  if (ad.category && ad.location) {
    push(`${ad.category} in ${ad.location}`);
    push(`${ad.category} ${ad.location}`);
  }

  return cleaned.slice(0, 20);
}

function normalizeAdRow(row) {
  if (!row) return null;
  return {
    ...row,
    images: parseImagesField(row.images),
    tags: parseTagsField(row.tags),
    title_en: row.title_en || row.title || '',
    title_el: row.title_el || row.title || '',
    description_en: row.description_en || row.description || '',
    description_el: row.description_el || row.description || '',
    category_en: row.category_en || row.category || '',
    category_el: row.category_el || row.category || '',
    location_en: row.location_en || row.location || '',
    location_el: row.location_el || row.location || '',
    source_language: SUPPORTED_LANGS.includes(row.source_language) ? row.source_language : 'en'
  };
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
}

function createAd(ad) {
  const images = Array.isArray(ad.images) ? ad.images.slice(0, 4) : [];
  const sourceLanguage = SUPPORTED_LANGS.includes(ad.source_language) ? ad.source_language : 'en';
  const fallbackLanguage = sourceLanguage === 'en' ? 'el' : 'en';

  const localized = {
    title_en: ad.title_en || (sourceLanguage === 'en' ? ad.title : ''),
    title_el: ad.title_el || (sourceLanguage === 'el' ? ad.title : ''),
    description_en: ad.description_en || (sourceLanguage === 'en' ? ad.description : ''),
    description_el: ad.description_el || (sourceLanguage === 'el' ? ad.description : ''),
    category_en: ad.category_en || (sourceLanguage === 'en' ? ad.category : ad.category_en || ''),
    category_el: ad.category_el || (sourceLanguage === 'el' ? ad.category : ad.category_el || ''),
    location_en: ad.location_en || (sourceLanguage === 'en' ? ad.location : ad.location_en || ''),
    location_el: ad.location_el || (sourceLanguage === 'el' ? ad.location : ad.location_el || '')
  };

  const fieldsForTags = {
    title: localized[`title_${sourceLanguage}`] || localized[`title_${fallbackLanguage}`],
    description:
      localized[`description_${sourceLanguage}`] || localized[`description_${fallbackLanguage}`],
    category: localized[`category_${sourceLanguage}`] || localized[`category_${fallbackLanguage}`],
    location: localized[`location_${sourceLanguage}`] || localized[`location_${fallbackLanguage}`]
  };

  const tags = ensureTags(fieldsForTags, ad.tags);

  const baseTitle = fieldsForTags.title || '';
  const baseDescription = fieldsForTags.description || '';
  const baseCategory = fieldsForTags.category || '';
  const baseLocation = fieldsForTags.location || '';

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const stmt = `INSERT INTO ads (title, description, category, location, price, images, tags, title_en, title_el, description_en, description_el, category_en, category_el, location_en, location_el, source_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      sqliteDB.run(
        stmt,
        [
          baseTitle,
          baseDescription,
          baseCategory,
          baseLocation,
          ad.price ?? null,
          JSON.stringify(images),
          JSON.stringify(tags),
          localized.title_en,
          localized.title_el,
          localized.description_en,
          localized.description_el,
          localized.category_en,
          localized.category_el,
          localized.location_en,
          localized.location_el,
          sourceLanguage
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            title: baseTitle,
            description: baseDescription,
            category: baseCategory,
            location: baseLocation,
            price: ad.price ?? null,
            created_at: new Date().toISOString(),
            images,
            tags,
            ...localized,
            source_language: sourceLanguage
          });
        }
      );
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const nextId = (store.ads.length ? Math.max(...store.ads.map((a) => a.id)) : 0) + 1;
    const newAd = {
      id: nextId,
      title: baseTitle,
      description: baseDescription,
      category: baseCategory,
      location: baseLocation,
      price: ad.price ?? null,
      created_at: new Date().toISOString(),
      images,
      tags,
      ...localized,
      source_language: sourceLanguage
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

async function clearAds() {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.run('DELETE FROM ads', (err) => {
        if (err) return reject(err);
        sqliteDB.run("DELETE FROM sqlite_sequence WHERE name='ads'", () => resolve());
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    store.ads = [];
    _writeJson(store);
    resolve();
  });
}

async function seedAdsForCategories(categoriesList, targetPerCategory = 1) {
  if (!Array.isArray(categoriesList) || !categoriesList.length) return 0;

  let created = 0;

  await clearAds();

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
        clauses.push(
          '((title LIKE ? OR description LIKE ? OR tags LIKE ? OR title_en LIKE ? OR description_en LIKE ? OR title_el LIKE ? OR description_el LIKE ?))'
        );
        const term = `%${filters.keywords}%`;
        params.push(term, term, term, term, term, term, term);
      }

      if (filters.category) {
        clauses.push('(category LIKE ? OR category_en LIKE ? OR category_el LIKE ?)');
        const catTerm = `%${filters.category}%`;
        params.push(catTerm, catTerm, catTerm);
      }

      if (filters.location) {
        clauses.push('(location LIKE ? OR location_en LIKE ? OR location_el LIKE ?)');
        const locTerm = `%${filters.location}%`;
        params.push(locTerm, locTerm, locTerm);
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
      results = results.filter((a) => {
        const fieldValues = [
          a.title,
          a.description,
          a.title_en,
          a.title_el,
          a.description_en,
          a.description_el
        ]
          .map((v) => (v || '').toString().toLowerCase())
          .some((v) => v.includes(kw));
        const tagMatch = (a.tags || []).some((tag) => (tag || '').toLowerCase().includes(kw));
        return fieldValues || tagMatch;
      });
    }

    if (filters.category) {
      const cat = filters.category.toLowerCase();
      results = results.filter((a) =>
        [a.category, a.category_en, a.category_el]
          .map((v) => (v || '').toLowerCase())
          .some((v) => v.includes(cat))
      );
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter((a) =>
        [a.location, a.location_en, a.location_el]
          .map((v) => (v || '').toLowerCase())
          .some((v) => v.includes(loc))
      );
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
  seedAdsForCategories,
  clearAds
};
