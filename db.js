const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbFile = path.join(__dirname, 'speedlist.db');
const jsonFile = path.join(__dirname, 'speedlist.json');

const SUPPORTED_LANGS = ['en', 'el'];
const DEFAULT_APPROVED = true;
const DEFAULT_EDIT_LIMIT = Number.isFinite(Number(process.env.AD_EDIT_LIMIT))
  ? Number(process.env.AD_EDIT_LIMIT)
  : 3;
const DEFAULT_ACTIVE = true;

const DEFAULT_USER_TEMPLATE = {
  verified: false,
  verification_token: null,
  disabled: false,
  nickname: '',
  phone: ''
};

function normalizeForSearch(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase();
}

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
            subcategory TEXT,
            location TEXT,
            price REAL,
            contact_phone TEXT,
            contact_email TEXT,
            visits INTEGER DEFAULT 0,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            title_en TEXT,
            title_el TEXT,
            description_en TEXT,
            description_el TEXT,
            category_en TEXT,
            category_el TEXT,
            subcategory_en TEXT,
            subcategory_el TEXT,
            location_en TEXT,
            location_el TEXT,
            source_language TEXT,
            approved INTEGER DEFAULT 0,
            user_id INTEGER,
            remaining_edits INTEGER DEFAULT ${DEFAULT_EDIT_LIMIT},
            active INTEGER DEFAULT 1
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

      sqliteDB.run('ALTER TABLE ads ADD COLUMN contact_phone TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add contact_phone column to ads table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE ads ADD COLUMN contact_email TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add contact_email column to ads table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE ads ADD COLUMN subcategory TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add subcategory column to ads table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE ads ADD COLUMN visits INTEGER DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add visits column to ads table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE ads ADD COLUMN approved INTEGER DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add approved column to ads table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE ads ADD COLUMN user_id INTEGER', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add user_id column to ads table:', err.message);
        }
      });

      sqliteDB.run(`ALTER TABLE ads ADD COLUMN remaining_edits INTEGER DEFAULT ${DEFAULT_EDIT_LIMIT}`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add remaining_edits column to ads table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE ads ADD COLUMN active INTEGER DEFAULT 1', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add active column to ads table:', err.message);
        }
      });

      const langColumns = [
        'title_en',
        'title_el',
        'description_en',
        'description_el',
        'category_en',
        'category_el',
        'subcategory_en',
        'subcategory_el',
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
        `CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad_id INTEGER NOT NULL,
            reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
      );

      sqliteDB.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            verified INTEGER DEFAULT 0,
            verification_token TEXT,
            disabled INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            nickname TEXT,
            phone TEXT NOT NULL
          )`
      );

      sqliteDB.run('ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add verified column to users table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE users ADD COLUMN verification_token TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add verification_token column to users table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE users ADD COLUMN disabled INTEGER DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add disabled column to users table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE users ADD COLUMN nickname TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add nickname column to users table:', err.message);
        }
      });

      sqliteDB.run('ALTER TABLE users ADD COLUMN phone TEXT', (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.warn('Could not add phone column to users table:', err.message);
        }
      });
    });
    return;
  }

  // JSON fallback: ensure file exists
  if (!fs.existsSync(jsonFile)) {
    fs.writeFileSync(jsonFile, JSON.stringify({ ads: [], users: [], reports: [] }, null, 2));
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
      const remainingEdits = Number.isFinite(Number(ad.remaining_edits))
        ? Number(ad.remaining_edits)
        : DEFAULT_EDIT_LIMIT;

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
        tags: Array.isArray(ad.tags) ? ad.tags : [],
        contact_phone: typeof ad.contact_phone === 'string' ? ad.contact_phone : '',
        contact_email: typeof ad.contact_email === 'string' ? ad.contact_email : '',
        visits: Number.isFinite(ad.visits) ? ad.visits : 0,
        approved: typeof ad.approved === 'boolean' ? ad.approved : DEFAULT_APPROVED,
        active: typeof ad.active === 'boolean' ? ad.active : Number(ad.active) !== 0,
        user_id: Number.isFinite(ad.user_id) ? ad.user_id : null,
        remaining_edits: remainingEdits
      };
    });
    current.users = (current.users || []).map((user) => ({
      ...DEFAULT_USER_TEMPLATE,
      ...user,
      verified: typeof user.verified === 'boolean' ? user.verified : true,
      verification_token: user.verification_token || null,
      disabled: typeof user.disabled === 'boolean' ? user.disabled : false,
      nickname: (user.nickname || '').trim() || deriveNickname(user.email, user.id),
      phone: typeof user.phone === 'string' ? user.phone : ''
    }));

    current.reports = Array.isArray(current.reports)
      ? current.reports.map((report, idx) => ({
          id: Number.isFinite(report.id) ? report.id : idx + 1,
          ad_id: report.ad_id,
          reason: typeof report.reason === 'string' ? report.reason : '',
          created_at: report.created_at || new Date().toISOString()
        }))
      : [];
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

function deriveNickname(email, fallbackId) {
  if (typeof email === 'string' && email.includes('@')) {
    const candidate = email.split('@')[0].trim();
    if (candidate) return candidate;
  }

  if (fallbackId) {
    return `user-${fallbackId}`;
  }

  return 'user';
}

function sanitizeUser(row) {
  if (!row) return null;
  const { password_hash, salt, verification_token, ...rest } = row;
  return {
    ...DEFAULT_USER_TEMPLATE,
    ...rest,
    verified: typeof row.verified === 'boolean' ? row.verified : Number(row.verified) === 1,
    verification_token: null,
    disabled: typeof row.disabled === 'boolean' ? row.disabled : Number(row.disabled) === 1,
    nickname: (row.nickname || '').trim() || deriveNickname(row.email, row.id),
    phone: (row.phone || '').toString().trim()
  };
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
    subcategory,
    location: randomFrom(cities),
    price,
    images: [],
    contact_phone: '+30 210 0000000',
    contact_email: 'info@example.com',
    visits: 0
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

  const push = (value, { allowStopword = false, allowShort = false } = {}) => {
    const tag = (value || '').toString().trim().toLowerCase();
    if (!tag) return;

    const isStopword = stopwords.has(tag);
    if (!allowStopword && isStopword) return;
    if (!allowShort && tag.length <= 2) return;

    if (!cleaned.includes(tag)) {
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

  push(ad.category, { allowStopword: true, allowShort: true });
  push(ad.subcategory, { allowStopword: true, allowShort: true });
  push(ad.location);
  tokenize(ad.title).forEach((token) => push(token));
  tokenize(ad.description).forEach((token) => push(token));
  tokenize(ad.subcategory).forEach((token) => push(token));

  if (ad.category && ad.location) {
    push(`${ad.category} in ${ad.location}`);
    push(`${ad.category} ${ad.location}`);
  }

  if (ad.subcategory && ad.location) {
    push(`${ad.subcategory} in ${ad.location}`);
    push(`${ad.subcategory} ${ad.location}`);
  }

  push(ad.category, { allowStopword: true, allowShort: true });
  push(ad.subcategory, { allowStopword: true, allowShort: true });

  return cleaned.slice(0, 100);
}

function normalizeAdRow(row) {
  if (!row) return null;
  const visitsValue = Number(row.visits);
  const approvedValue = row.approved;
  const activeValue = row.active;
  const remainingEditsValue = Number(row.remaining_edits);
  return {
    ...row,
    user_id: Number.isFinite(Number(row.user_id)) ? Number(row.user_id) : null,
    images: parseImagesField(row.images),
    tags: parseTagsField(row.tags),
    contact_phone: typeof row.contact_phone === 'string' ? row.contact_phone : '',
    contact_email: typeof row.contact_email === 'string' ? row.contact_email : '',
    subcategory: typeof row.subcategory === 'string' ? row.subcategory : '',
    visits: Number.isFinite(visitsValue) ? visitsValue : 0,
    approved: typeof approvedValue === 'boolean' ? approvedValue : Number(approvedValue) === 1,
    active: typeof activeValue === 'boolean' ? activeValue : Number(activeValue) !== 0,
    remaining_edits: Number.isFinite(remainingEditsValue) ? remainingEditsValue : DEFAULT_EDIT_LIMIT,
    title_en: row.title_en || row.title || '',
    title_el: row.title_el || row.title || '',
    description_en: row.description_en || row.description || '',
    description_el: row.description_el || row.description || '',
    category_en: row.category_en || row.category || '',
    category_el: row.category_el || row.category || '',
    subcategory_en: row.subcategory_en || row.subcategory || '',
    subcategory_el: row.subcategory_el || row.subcategory || '',
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
  const contactPhone = typeof ad.contact_phone === 'string' ? ad.contact_phone : '';
  const contactEmail = typeof ad.contact_email === 'string' ? ad.contact_email : '';
  const visits = Number.isFinite(ad.visits) ? ad.visits : 0;
  const approved = typeof ad.approved === 'boolean' ? ad.approved : false;
  const active = typeof ad.active === 'boolean' ? ad.active : DEFAULT_ACTIVE;
  const userId = Number.isFinite(Number(ad.user_id)) ? Number(ad.user_id) : null;
  const remainingEdits = Number.isFinite(Number(ad.remaining_edits))
    ? Number(ad.remaining_edits)
    : DEFAULT_EDIT_LIMIT;

  const localized = {
    title_en: ad.title_en || (sourceLanguage === 'en' ? ad.title : ''),
    title_el: ad.title_el || (sourceLanguage === 'el' ? ad.title : ''),
    description_en: ad.description_en || (sourceLanguage === 'en' ? ad.description : ''),
    description_el: ad.description_el || (sourceLanguage === 'el' ? ad.description : ''),
    category_en: ad.category_en || (sourceLanguage === 'en' ? ad.category : ad.category_en || ''),
    category_el: ad.category_el || (sourceLanguage === 'el' ? ad.category : ad.category_el || ''),
    subcategory_en: ad.subcategory_en || (sourceLanguage === 'en' ? ad.subcategory : ad.subcategory_en || ''),
    subcategory_el: ad.subcategory_el || (sourceLanguage === 'el' ? ad.subcategory : ad.subcategory_el || ''),
    location_en: ad.location_en || (sourceLanguage === 'en' ? ad.location : ad.location_en || ''),
    location_el: ad.location_el || (sourceLanguage === 'el' ? ad.location : ad.location_el || '')
  };

  const fieldsForTags = {
    title: localized[`title_${sourceLanguage}`] || localized[`title_${fallbackLanguage}`],
    description:
      localized[`description_${sourceLanguage}`] || localized[`description_${fallbackLanguage}`],
    category: localized[`category_${sourceLanguage}`] || localized[`category_${fallbackLanguage}`],
    subcategory:
      localized[`subcategory_${sourceLanguage}`] || localized[`subcategory_${fallbackLanguage}`],
    location: localized[`location_${sourceLanguage}`] || localized[`location_${fallbackLanguage}`]
  };

  const tags = ensureTags(fieldsForTags, ad.tags);

  const baseTitle = fieldsForTags.title || '';
  const baseDescription = fieldsForTags.description || '';
  const baseCategory = fieldsForTags.category || '';
  const baseSubcategory = fieldsForTags.subcategory || '';
  const baseLocation = fieldsForTags.location || '';

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const stmt = `INSERT INTO ads (title, description, category, subcategory, location, price, contact_phone, contact_email, visits, images, tags, title_en, title_el, description_en, description_el, category_en, category_el, subcategory_en, subcategory_el, location_en, location_el, source_language, approved, user_id, remaining_edits, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      sqliteDB.run(
        stmt,
        [
          baseTitle,
          baseDescription,
          baseCategory,
          baseSubcategory,
          baseLocation,
          ad.price ?? null,
          contactPhone,
          contactEmail,
          visits,
          JSON.stringify(images),
          JSON.stringify(tags),
          localized.title_en,
          localized.title_el,
          localized.description_en,
          localized.description_el,
          localized.category_en,
          localized.category_el,
          localized.subcategory_en,
          localized.subcategory_el,
          localized.location_en,
          localized.location_el,
          sourceLanguage,
          approved ? 1 : 0,
          userId,
          remainingEdits,
          active ? 1 : 0
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            title: baseTitle,
            description: baseDescription,
            category: baseCategory,
            subcategory: baseSubcategory,
            location: baseLocation,
            price: ad.price ?? null,
            contact_phone: contactPhone,
            contact_email: contactEmail,
            visits,
            active,
            approved,
            user_id: userId,
            created_at: new Date().toISOString(),
            images,
            tags,
            remaining_edits: remainingEdits,
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
      subcategory: baseSubcategory,
      location: baseLocation,
      price: ad.price ?? null,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      visits,
      active,
      approved,
      user_id: userId,
      created_at: new Date().toISOString(),
      images,
      tags,
      remaining_edits: remainingEdits,
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
      await createAd({ ...ad, approved: true });
      created += 1;
    }
  }

  return created;
}

function getRecentAds(limit = 10, options = {}) {
  const includeUnapproved = options.includeUnapproved === true;
  const includeInactive = options.includeInactive === true;
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const clauses = [];
      if (!includeUnapproved) {
        clauses.push('approved = 1');
      }
      if (!includeInactive) {
        clauses.push('active = 1');
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      sqliteDB.all(
        `SELECT * FROM ads ${where} ORDER BY datetime(created_at) DESC LIMIT ?`,
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
      .filter((ad) => (includeUnapproved || ad.approved === true) && (includeInactive || ad.active !== false))
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
    resolve(rows.map((row) => normalizeAdRow(row)));
  });
}

function searchAds(filters, options = {}) {
  const normalizedTerms = {
    keywords: normalizeForSearch(filters.keywords),
    category: normalizeForSearch(filters.category),
    subcategory: normalizeForSearch(filters.subcategory),
    location: normalizeForSearch(filters.location)
  };

  const includeUnapproved = options.includeUnapproved === true;
  const includeInactive = options.includeInactive === true;

  const matchesKeywords = (ad) => {
    if (!normalizedTerms.keywords) return true;
    const fields = [
      ad.title,
      ad.description,
      ad.title_en,
      ad.title_el,
      ad.description_en,
      ad.description_el,
      ad.category,
      ad.subcategory,
      ad.category_en,
      ad.category_el,
      ad.subcategory_en,
      ad.subcategory_el
    ]
      .map((v) => normalizeForSearch(v))
      .some((v) => v.includes(normalizedTerms.keywords));

    const tagMatch = (ad.tags || [])
      .map((tag) => normalizeForSearch(tag))
      .some((tag) => tag.includes(normalizedTerms.keywords));

    return fields || tagMatch;
  };

  const matchesCategory = (ad) => {
    const categoryFields = [ad.category, ad.category_en, ad.category_el];
    const subcategoryFields = [ad.subcategory, ad.subcategory_en, ad.subcategory_el];

    const matchesCategoryTerm = normalizedTerms.category
      ? categoryFields.map((v) => normalizeForSearch(v)).some((v) => v.includes(normalizedTerms.category))
      : true;

    const matchesSubcategoryTerm = normalizedTerms.subcategory
      ? [...subcategoryFields, ...categoryFields]
          .map((v) => normalizeForSearch(v))
          .some((v) => v.includes(normalizedTerms.subcategory))
      : true;

    return matchesCategoryTerm && matchesSubcategoryTerm;
  };

  const matchesLocation = (ad) => {
    if (!normalizedTerms.location) return true;
    return [ad.location, ad.location_en, ad.location_el]
      .map((v) => normalizeForSearch(v))
      .some((v) => v.includes(normalizedTerms.location));
  };

  const applyFilters = (ads) => {
    let results = ads
      .filter((a) => (includeUnapproved || a.approved === true) && (includeInactive || a.active !== false))
      .slice();

    results = results.filter((ad) => matchesKeywords(ad) && matchesCategory(ad) && matchesLocation(ad));

    if (filters.min_price != null) {
      results = results.filter((a) => a.price != null && a.price >= filters.min_price);
    }

    if (filters.max_price != null) {
      results = results.filter((a) => a.price != null && a.price <= filters.max_price);
    }

    return results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
  };

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const clauses = [];
      const params = [];

      if (!includeInactive) {
        clauses.push('active = 1');
      }
      if (!includeUnapproved) {
        clauses.push('approved = 1');
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
      const query = `SELECT * FROM ads ${where} ORDER BY datetime(created_at) DESC LIMIT 200`;

      sqliteDB.all(query, params, (err, rows) => {
        if (err) return reject(err);
        const ads = rows.map(normalizeAdRow);
        resolve(applyFilters(ads));
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const ads = store.ads.map((row) => normalizeAdRow(row));
    resolve(applyFilters(ads));
  });
}

function getAdById(id, options = {}) {
  const includeUnapproved = options.includeUnapproved === true;
  const includeInactive = options.includeInactive === true;
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const clauses = ['id = ?'];
      if (!includeUnapproved) {
        clauses.push('approved = 1');
      }
      if (!includeInactive) {
        clauses.push('active = 1');
      }
      const where = clauses.join(' AND ');
      sqliteDB.get(`SELECT * FROM ads WHERE ${where}`, [id], (err, row) => {
        if (err) return reject(err);
        resolve(normalizeAdRow(row));
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const row = store.ads.find(
      (ad) =>
        ad.id === id &&
        (includeUnapproved || ad.approved === true) &&
        (includeInactive || ad.active !== false)
    );
    resolve(normalizeAdRow(row));
  });
}

function incrementAdVisits(id) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.run(`UPDATE ads SET visits = visits + 1 WHERE id = ? AND approved = 1 AND active = 1`, [id], (err) => {
        if (err) return reject(err);
        sqliteDB.get(`SELECT * FROM ads WHERE id = ?`, [id], (getErr, row) => {
          if (getErr) return reject(getErr);
          resolve(normalizeAdRow(row));
        });
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const row = store.ads.find((ad) => ad.id === id);
    if (row) {
      if (row.approved !== true || row.active === false) {
        return resolve(null);
      }
      const current = Number(row.visits);
      row.visits = Number.isFinite(current) ? current + 1 : 1;
      _writeJson(store);
    }
    resolve(normalizeAdRow(row));
  });
}

function listAdsByStatus(status = 'pending') {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const clauses = [];
      const params = [];

      if (status === 'pending') {
        clauses.push('approved = 0');
        clauses.push('active = 1');
      } else if (status === 'approved') {
        clauses.push('approved = 1');
        clauses.push('active = 1');
      }

      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

      sqliteDB.all(`SELECT * FROM ads ${where} ORDER BY datetime(created_at) DESC LIMIT 200`, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(normalizeAdRow));
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    let ads = store.ads.slice();

    if (status === 'pending') {
      ads = ads.filter((ad) => ad.approved !== true && ad.active !== false);
    } else if (status === 'approved') {
      ads = ads.filter((ad) => ad.approved === true && ad.active !== false);
    }

    ads = ads
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 200)
      .map((row) => normalizeAdRow(row));

    resolve(ads);
  });
}

async function setAdApproval(id, approved) {
  return updateAd(id, { approved: !!approved });
}

async function updateAd(id, updates = {}) {
  const existing = await getAdById(id, { includeUnapproved: true, includeInactive: true });
  if (!existing) return null;

  const sanitized = { ...existing };

  if (updates.title != null) {
    const title = updates.title.toString().trim();
    sanitized.title = title;
    sanitized.title_en = sanitized.title_en || title;
    sanitized.title_el = sanitized.title_el || title;
  }

  if (updates.description != null) {
    const description = updates.description.toString().trim();
    sanitized.description = description;
    sanitized.description_en = sanitized.description_en || description;
    sanitized.description_el = sanitized.description_el || description;
  }

  if (updates.category != null) {
    const category = updates.category.toString().trim();
    sanitized.category = category;
    sanitized.category_en = sanitized.category_en || category;
    sanitized.category_el = sanitized.category_el || category;
  }

  if (updates.subcategory != null) {
    const subcategory = updates.subcategory.toString().trim();
    sanitized.subcategory = subcategory;
    sanitized.subcategory_en = sanitized.subcategory_en || subcategory;
    sanitized.subcategory_el = sanitized.subcategory_el || subcategory;
  }

  if (updates.location != null) {
    const location = updates.location.toString().trim();
    sanitized.location = location;
    sanitized.location_en = sanitized.location_en || location;
    sanitized.location_el = sanitized.location_el || location;
  }

  if (updates.price !== undefined) {
    sanitized.price = Number.isFinite(Number(updates.price)) ? Number(updates.price) : null;
  }

  if (updates.contact_phone != null) {
    sanitized.contact_phone = updates.contact_phone.toString();
  }

  if (updates.contact_email != null) {
    sanitized.contact_email = updates.contact_email.toString();
  }

  if (updates.tags) {
    sanitized.tags = ensureTags({
      title: sanitized.title,
      description: sanitized.description,
      category: sanitized.category,
      subcategory: sanitized.subcategory,
      location: sanitized.location
    }, updates.tags);
  }

  if (updates.title_en != null) {
    sanitized.title_en = updates.title_en.toString().trim();
  }

  if (updates.title_el != null) {
    sanitized.title_el = updates.title_el.toString().trim();
  }

  if (updates.description_en != null) {
    sanitized.description_en = updates.description_en.toString().trim();
  }

  if (updates.description_el != null) {
    sanitized.description_el = updates.description_el.toString().trim();
  }

  if (updates.category_en != null) {
    sanitized.category_en = updates.category_en.toString().trim();
  }

  if (updates.category_el != null) {
    sanitized.category_el = updates.category_el.toString().trim();
  }

  if (updates.subcategory_en != null) {
    sanitized.subcategory_en = updates.subcategory_en.toString().trim();
  }

  if (updates.subcategory_el != null) {
    sanitized.subcategory_el = updates.subcategory_el.toString().trim();
  }

  if (updates.location_en != null) {
    sanitized.location_en = updates.location_en.toString().trim();
  }

  if (updates.location_el != null) {
    sanitized.location_el = updates.location_el.toString().trim();
  }

  if (updates.source_language && SUPPORTED_LANGS.includes(updates.source_language)) {
    sanitized.source_language = updates.source_language;
  }

  if (updates.remaining_edits != null) {
    const remaining = Number(updates.remaining_edits);
    sanitized.remaining_edits = Number.isFinite(remaining) ? Math.max(0, Math.floor(remaining)) : sanitized.remaining_edits;
  }

  if (updates.images) {
    sanitized.images = Array.isArray(updates.images)
      ? updates.images.filter((img) => typeof img === 'string').slice(0, 4)
      : sanitized.images;
  }

  if (typeof updates.approved === 'boolean') {
    sanitized.approved = updates.approved;
  }

  if (typeof updates.active === 'boolean') {
    sanitized.active = updates.active;
  }

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const stmt =
        'UPDATE ads SET title = ?, description = ?, category = ?, subcategory = ?, location = ?, price = ?, contact_phone = ?, contact_email = ?, tags = ?, images = ?, approved = ?, title_en = ?, title_el = ?, description_en = ?, description_el = ?, category_en = ?, category_el = ?, subcategory_en = ?, subcategory_el = ?, location_en = ?, location_el = ?, source_language = ?, remaining_edits = ?, active = ? WHERE id = ?';

      const params = [
        sanitized.title,
        sanitized.description,
        sanitized.category,
        sanitized.subcategory,
        sanitized.location,
        sanitized.price ?? null,
        sanitized.contact_phone,
        sanitized.contact_email,
        JSON.stringify(sanitized.tags || []),
        JSON.stringify(sanitized.images || []),
        sanitized.approved ? 1 : 0,
        sanitized.title_en,
        sanitized.title_el,
        sanitized.description_en,
        sanitized.description_el,
        sanitized.category_en,
        sanitized.category_el,
        sanitized.subcategory_en,
        sanitized.subcategory_el,
        sanitized.location_en,
        sanitized.location_el,
        sanitized.source_language,
        sanitized.remaining_edits,
        sanitized.active ? 1 : 0,
        id
      ];

      sqliteDB.run(stmt, params, (err) => {
        if (err) return reject(err);
        resolve(normalizeAdRow(sanitized));
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const idx = store.ads.findIndex((ad) => ad.id === id);
    if (idx === -1) return resolve(null);
    store.ads[idx] = { ...store.ads[idx], ...sanitized };
    _writeJson(store);
    resolve(normalizeAdRow(store.ads[idx]));
  });
}

async function deleteAd(id) {
  const existing = await getAdById(id, { includeUnapproved: true, includeInactive: true });
  if (!existing) return null;

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.run(`DELETE FROM ads WHERE id = ?`, [id], (err) => {
        if (err) return reject(err);
        resolve(existing);
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    store.ads = (store.ads || []).filter((ad) => ad.id !== id);
    _writeJson(store);
    resolve(existing);
  });
}

function listUsers() {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.all(
        `SELECT id, email, created_at, verified, disabled, phone FROM users ORDER BY datetime(created_at) DESC`,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows.map((row) => sanitizeUser({ ...row, verification_token: null })));
        }
      );
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    resolve((store.users || []).map((user) => sanitizeUser(user)));
  });
}

function updateUser(id, { email, password, verified, disabled, nickname, phone }) {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.get(`SELECT * FROM users WHERE id = ?`, [id], (findErr, row) => {
        if (findErr) return reject(findErr);
        if (!row) return resolve(null);

        const updates = {
          email: row.email,
          password_hash: row.password_hash,
          salt: row.salt,
          verified: Number(row.verified),
          verification_token: row.verification_token,
          disabled: Number(row.disabled) || 0,
          nickname: (row.nickname || '').trim() || deriveNickname(row.email, row.id),
          phone: (row.phone || '').trim()
        };

        if (email) {
          updates.email = email.toLowerCase();
        }

        if (password) {
          updates.salt = crypto.randomBytes(16).toString('hex');
          updates.password_hash = hashPassword(password, updates.salt);
        }

        if (typeof verified === 'boolean') {
          updates.verified = verified ? 1 : 0;
          updates.verification_token = null;
        }

        if (typeof disabled === 'boolean') {
          updates.disabled = disabled ? 1 : 0;
        }

        if (typeof nickname === 'string') {
          updates.nickname = nickname.trim() || updates.nickname;
        }

        if (typeof phone === 'string' && phone.trim()) {
          updates.phone = phone.trim();
        }

        const stmt = `UPDATE users SET email = ?, password_hash = ?, salt = ?, verified = ?, verification_token = ?, disabled = ?, nickname = ?, phone = ? WHERE id = ?`;
        sqliteDB.run(
          stmt,
          [
            updates.email,
            updates.password_hash,
            updates.salt,
            updates.verified,
            updates.verification_token,
            updates.disabled,
            updates.nickname,
            updates.phone,
            id
          ],
          (err) => {
            if (err) return reject(err);
            resolve({
              id,
              email: updates.email,
              created_at: row.created_at,
              verified: !!updates.verified,
              disabled: !!updates.disabled,
              nickname: updates.nickname,
              phone: updates.phone
            });
          }
        );
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const idx = store.users.findIndex((u) => u.id === id);
    if (idx === -1) return resolve(null);

    if (email) {
      store.users[idx].email = email.toLowerCase();
    }

    if (password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      store.users[idx].salt = salt;
      store.users[idx].password_hash = passwordHash;
    }

    if (typeof verified === 'boolean') {
      store.users[idx].verified = verified;
      store.users[idx].verification_token = null;
    }

    if (typeof disabled === 'boolean') {
      store.users[idx].disabled = disabled;
    }

    if (typeof nickname === 'string') {
      const trimmed = nickname.trim();
      store.users[idx].nickname = trimmed || store.users[idx].nickname || deriveNickname(store.users[idx].email, id);
    }

    if (typeof phone === 'string' && phone.trim()) {
      store.users[idx].phone = phone.trim();
    }

    _writeJson(store);
    resolve(sanitizeUser(store.users[idx]));
  });
}

function registerUser({ email, password, nickname, phone }) {
  if (!email || !password || !phone) {
    return Promise.reject(new Error('Email, phone and password are required'));
  }

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const stmt = `INSERT INTO users (email, password_hash, salt, verified, verification_token, disabled, nickname, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      sqliteDB.run(
        stmt,
        [email.toLowerCase(), passwordHash, salt, 0, verificationToken, 0, (nickname || '').trim(), (phone || '').trim()],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE')) {
              return reject(new Error('Email already registered'));
            }
            return reject(err);
          }

          sqliteDB.get(
            `SELECT id, email, created_at, verified, verification_token, nickname, phone FROM users WHERE id = ?`,
            [this.lastID],
            (getErr, row) => {
              if (getErr) return reject(getErr);
              resolve({ user: sanitizeUser(row), verificationToken });
            }
          );
        }
      );
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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const nextId = (store.users.length ? Math.max(...store.users.map((u) => u.id)) : 0) + 1;
    const user = {
      id: nextId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      salt,
      created_at: new Date().toISOString(),
      verified: false,
      verification_token: verificationToken,
      disabled: false,
      nickname: (nickname || '').trim() || deriveNickname(email, nextId),
      phone: (phone || '').trim()
    };
    store.users.push(user);
    _writeJson(store);
    resolve({ user: sanitizeUser(user), verificationToken });
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

        const sanitized = sanitizeUser(row);
        if (sanitized.disabled) {
          return reject(new Error('Account disabled'));
        }
        if (!sanitized.verified) {
          return reject(new Error('Email not verified'));
        }
        resolve(sanitized);
      });
    });
  }

  return new Promise((resolve, reject) => {
    const store = _readJson();
    const row = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!row) return reject(new Error('Invalid email or password'));
    const expected = hashPassword(password, row.salt);
    if (expected !== row.password_hash) return reject(new Error('Invalid email or password'));
    const sanitized = sanitizeUser(row);
    if (sanitized.disabled) return reject(new Error('Account disabled'));
    if (!sanitized.verified) return reject(new Error('Email not verified'));
    resolve(sanitized);
  });
}

function getUserById(id) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return Promise.resolve(null);

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.get(`SELECT * FROM users WHERE id = ?`, [numericId], (err, row) => {
        if (err) return reject(err);
        resolve(sanitizeUser(row));
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const row = (store.users || []).find((user) => user.id === numericId);
    resolve(sanitizeUser(row));
  });
}

function verifyUserByToken(token) {
  if (!token) return Promise.resolve(null);

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.get(`SELECT * FROM users WHERE verification_token = ?`, [token], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        sqliteDB.run(
          `UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?`,
          [row.id],
          (updateErr) => {
            if (updateErr) return reject(updateErr);
            resolve(sanitizeUser({ ...row, verified: 1, verification_token: null }));
          }
        );
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const idx = (store.users || []).findIndex((user) => user.verification_token === token);
    if (idx === -1) return resolve(null);
    store.users[idx].verified = true;
    store.users[idx].verification_token = null;
    _writeJson(store);
    resolve(sanitizeUser(store.users[idx]));
  });
}

function listAdsByUser(userId) {
  const numericId = Number(userId);
  if (!Number.isFinite(numericId)) return Promise.resolve([]);

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.all(
        `SELECT * FROM ads WHERE user_id = ? ORDER BY datetime(created_at) DESC`,
        [numericId],
        (err, rows) => {
          if (err) return reject(err);
          resolve((rows || []).map((row) => normalizeAdRow(row)));
        }
      );
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const ads = (store.ads || []).filter((ad) => ad.user_id === numericId);
    resolve(ads.map((ad) => normalizeAdRow(ad)));
  });
}

function saveReport({ adId, reason }) {
  if (!Number.isFinite(adId)) return Promise.reject(new Error('Invalid ad id'));

  const safeReason = typeof reason === 'string' ? reason : '';

  if (useSqlite) {
    return new Promise((resolve, reject) => {
      const stmt = `INSERT INTO reports (ad_id, reason) VALUES (?, ?)`;
      sqliteDB.run(stmt, [adId, safeReason], function (err) {
        if (err) return reject(err);

        sqliteDB.get(
          `SELECT id, ad_id, reason, created_at FROM reports WHERE id = ?`,
          [this.lastID],
          (getErr, row) => {
            if (getErr) return reject(getErr);
            resolve(row);
          }
        );
      });
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const reports = Array.isArray(store.reports) ? store.reports : [];
    const nextId = (reports.length ? Math.max(...reports.map((r) => r.id || 0)) : 0) + 1;
    const report = {
      id: nextId,
      ad_id: adId,
      reason: safeReason,
      created_at: new Date().toISOString()
    };
    store.reports = [...reports, report];
    _writeJson(store);
    resolve(report);
  });
}

function listReports() {
  if (useSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDB.all(
        `SELECT id, ad_id, reason, created_at FROM reports ORDER BY datetime(created_at) DESC LIMIT 200`,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  }

  return new Promise((resolve) => {
    const store = _readJson();
    const reports = Array.isArray(store.reports) ? store.reports : [];
    resolve([...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 200));
  });
}

module.exports = {
  init,
  createAd,
  getRecentAds,
  searchAds,
  getAdById,
  incrementAdVisits,
  listAdsByStatus,
  setAdApproval,
  updateAd,
  deleteAd,
  listUsers,
  updateUser,
  registerUser,
  loginUser,
  getUserById,
  verifyUserByToken,
  listAdsByUser,
  seedAdsForCategories,
  clearAds,
  saveReport,
  listReports
};
