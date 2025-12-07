const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai').default;
const db = require('./db');
const categories = require('./categories');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use('/static', express.static(path.join(__dirname, 'public')));

db.init();

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supportedLanguages = ['en', 'el'];
const messageCatalog = {
  en: {
    promptRequired: 'Prompt is required',
    openaiMissing: 'OpenAI API key not configured',
    aiInvalidJson: 'AI response was not valid JSON',
    aiMissingFields: 'AI did not return required ad fields',
    createAdFailure: 'Failed to create ad with AI',
    recentAdsError: 'Failed to fetch recent ads',
    searchAdsError: 'Failed to search ads with AI',
    invalidAdId: 'Invalid ad id',
    adNotFound: 'Ad not found',
    fetchAdError: 'Failed to fetch ad',
    authMissingFields: 'Email and password are required',
    authInvalidEmail: 'Please provide a valid email address',
    authPasswordLength: 'Password must be at least 6 characters',
    authEmailExists: 'Email already registered',
    authRegistrationSuccess: 'Account created. You are now signed in.',
    authRegistrationFailed: 'Registration failed',
    authLoginSuccess: 'Login successful.',
    authLoginFailed: 'Login failed',
    authInvalidCredentials: 'Invalid email or password'
  },
  el: {
    promptRequired: 'Απαιτείται προτροπή',
    openaiMissing: 'Δεν έχει ρυθμιστεί το κλειδί OpenAI',
    aiInvalidJson: 'Η απόκριση του AI δεν ήταν έγκυρο JSON',
    aiMissingFields: 'Το AI δεν επέστρεψε τα απαραίτητα πεδία',
    createAdFailure: 'Αποτυχία δημιουργίας αγγελίας με AI',
    recentAdsError: 'Αποτυχία ανάκτησης πρόσφατων αγγελιών',
    searchAdsError: 'Αποτυχία αναζήτησης αγγελιών με AI',
    invalidAdId: 'Μη έγκυρο αναγνωριστικό αγγελίας',
    adNotFound: 'Δεν βρέθηκε η αγγελία',
    fetchAdError: 'Αποτυχία ανάκτησης αγγελίας',
    authMissingFields: 'Απαιτούνται email και κωδικός',
    authInvalidEmail: 'Παρακαλώ δώστε ένα έγκυρο email',
    authPasswordLength: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες',
    authEmailExists: 'Το email είναι ήδη καταχωρημένο',
    authRegistrationSuccess: 'Ο λογαριασμός δημιουργήθηκε. Συνδεθήκατε.',
    authRegistrationFailed: 'Η εγγραφή απέτυχε',
    authLoginSuccess: 'Επιτυχής σύνδεση.',
    authLoginFailed: 'Η σύνδεση απέτυχε',
    authInvalidCredentials: 'Λανθασμένο email ή κωδικός'
  }
};

function resolveLanguage(preferred, req) {
  const candidate = (preferred || req.get('x-language') || '').toLowerCase();
  return supportedLanguages.includes(candidate) ? candidate : 'en';
}

function tServer(lang, key) {
  const table = messageCatalog[lang] || messageCatalog.en;
  return table[key] || messageCatalog.en[key] || key;
}

function buildUserContent(prompt, images) {
  const content = [
    {
      type: 'text',
      text: prompt
    }
  ];

  const validImages = (Array.isArray(images) ? images : [])
    .filter((img) => typeof img === 'string' && img.startsWith('data:image/'))
    .slice(0, 4);

  validImages.forEach((img) => {
    content.push({
      type: 'image_url',
      image_url: { url: img }
    });
  });

  return content;
}

function sanitizeImages(images) {
  return (Array.isArray(images) ? images : [])
    .filter((img) => typeof img === 'string' && img.startsWith('data:image/'))
    .slice(0, 4);
}

function uniqueTags(list) {
  const seen = new Set();
  list.forEach((tag) => {
    const clean = (tag || '').toString().trim().toLowerCase();
    if (clean) {
      seen.add(clean);
    }
  });
  return Array.from(seen);
}

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

function tokenize(value) {
  if (!value) return [];
  return value
    .toString()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function keywordTokens(value) {
  return tokenize(value).filter((token) => token.length > 2 && !stopwords.has(token));
}

function buildTags(ad) {
  const tags = [];
  const { title = '', description = '', category = '', location = '', price } = ad || {};

  tags.push(category, location);
  tags.push(...keywordTokens(title));
  tags.push(...keywordTokens(description));
  tags.push(...keywordTokens(category));
  tags.push(...keywordTokens(location));

  if (category && location) {
    tags.push(`${category} in ${location}`);
    tags.push(`${category} ${location}`);
  }

  if (price != null) {
    tags.push('for sale', 'priced listing');
    const rounded = Math.max(0, Math.round(Number(price)));
    tags.push(`budget ${Math.ceil(rounded / 50) * 50}eur`);
  }

  const combined = uniqueTags(tags);
  return combined.slice(0, 20);
}

async function translateListing(ad, lang) {
  if (!ad || !supportedLanguages.includes(lang)) return ad;
  if (!process.env.OPENAI_API_KEY) return ad;

  const languageLabel = lang === 'el' ? 'Greek' : 'English';

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Translate the following classified listing fields to the target language. ' +
            'Return ONLY valid JSON with keys: title, description, category, location. ' +
            `Use ${languageLabel} for all textual values.`
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: ad.title || '',
            description: ad.description || '',
            category: ad.category || '',
            location: ad.location || ''
          })
        }
      ],
      temperature: 0
    });

    let message = completion.choices[0]?.message?.content || '{}';

    if (message.trim().startsWith('```')) {
      message = message.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }

    const translated = JSON.parse(message);
    return {
      title: translated.title || ad.title,
      description: translated.description || ad.description,
      category: translated.category || ad.category,
      location: translated.location || ad.location
    };
  } catch (error) {
    console.error('Failed to translate listing', error);
    return ad;
  }
}

function formatAdForLanguage(ad, lang) {
  const preferred = supportedLanguages.includes(lang) ? lang : 'en';
  const fallback = preferred === 'en' ? 'el' : 'en';

  const localized = {
    title: ad[`title_${preferred}`] || ad[`title_${fallback}`] || ad.title || '',
    description:
      ad[`description_${preferred}`] || ad[`description_${fallback}`] || ad.description || '',
    category: ad[`category_${preferred}`] || ad[`category_${fallback}`] || ad.category || '',
    location: ad[`location_${preferred}`] || ad[`location_${fallback}`] || ad.location || ''
  };

  return {
    ...ad,
    ...localized
  };
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ------------------------------------------------------
   GET RECENT ADS
------------------------------------------------------ */
app.get('/api/ads/recent', async (req, res) => {
  const lang = resolveLanguage(null, req);
  try {
    const ads = await db.getRecentAds(10);
    const localized = ads.map((ad) => formatAdForLanguage(ad, lang));
    res.json({ ads: localized });
  } catch (error) {
    console.error('Error fetching recent ads', error);
    res.status(500).json({ error: tServer(lang, 'recentAdsError') });
  }
});

/* ------------------------------------------------------
   GET CATEGORY TREE
------------------------------------------------------ */
app.get('/api/categories', (req, res) => {
  res.json({ categories });
});

/* ------------------------------------------------------
   CREATE AD USING AI
------------------------------------------------------ */
app.post('/api/ai/create-ad', async (req, res) => {
  const { prompt, images = [], language } = req.body || {};
  const lang = resolveLanguage(language, req);
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: tServer(lang, 'promptRequired') });
  }

  const cleanedImages = sanitizeImages(images);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: tServer(lang, 'openaiMissing') });
  }

  try {
    const languageLabel = lang === 'el' ? 'Greek' : 'English';
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },   // <== FORCE JSON
      messages: [
        {
          role: 'system',
          content:
            'You convert natural language into structured classified ads. ' +
            'Respond ONLY with valid JSON with keys: title (string), description (string), ' +
            'category (string), location (string), price (number or null), contact_phone (string), contact_email (string), visits (number). ' +
            `Use ${languageLabel} for all textual fields based on language code ${lang}.`
        },
        { role: 'user', content: buildUserContent(prompt, cleanedImages) }
      ],
      temperature: 0.2
    });

    let message = completion.choices[0]?.message?.content || '{}';

    // Log raw response once for debugging
    console.log('AI create-ad raw message:', message);

    // In case the model ever wraps JSON in ``` ```
    if (message.trim().startsWith('```')) {
      message = message.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }

    let adData;
    try {
      adData = JSON.parse(message);
    } catch (jsonError) {
      console.error('JSON parse error on create-ad:', jsonError, message);
      return res.status(500).json({ error: tServer(lang, 'aiInvalidJson') });
    }

    if (!adData.title || !adData.description) {
      return res.status(400).json({ error: tServer(lang, 'aiMissingFields') });
    }

    const tags = buildTags(adData);
    const contact_phone = typeof adData.contact_phone === 'string' ? adData.contact_phone : '';
    const contact_email = typeof adData.contact_email === 'string' ? adData.contact_email : '';
    const visits = Number.isFinite(Number(adData.visits)) ? Number(adData.visits) : 0;

    const otherLang = lang === 'en' ? 'el' : 'en';
    const translated = await translateListing(adData, otherLang);

    const saved = await db.createAd({
      title: adData.title,
      description: adData.description,
      category: adData.category || '',
      location: adData.location || '',
      price: typeof adData.price === 'number' ? adData.price : null,
      contact_phone,
      contact_email,
      visits,
      images: cleanedImages,
      tags,
      source_language: lang,
      [`title_${lang}`]: adData.title,
      [`description_${lang}`]: adData.description,
      [`category_${lang}`]: adData.category || '',
      [`location_${lang}`]: adData.location || '',
      [`title_${otherLang}`]: translated.title || adData.title,
      [`description_${otherLang}`]: translated.description || adData.description,
      [`category_${otherLang}`]: translated.category || adData.category || '',
      [`location_${otherLang}`]: translated.location || adData.location || ''
    });

    const localized = formatAdForLanguage(saved, lang);

    res.json({ ad: localized });
  } catch (error) {
    console.error('Error creating ad with AI', error);
    res.status(500).json({ error: tServer(lang, 'createAdFailure') });
  }
});

/* ------------------------------------------------------
   SEARCH ADS USING AI
------------------------------------------------------ */
app.post('/api/ai/search-ads', async (req, res) => {
  const { prompt, images = [], language } = req.body || {};
  const lang = resolveLanguage(language, req);
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: tServer(lang, 'promptRequired') });
  }

  const cleanedImages = sanitizeImages(images);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: tServer(lang, 'openaiMissing') });
  }

  try {
    const languageLabel = lang === 'el' ? 'Greek' : 'English';
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Convert natural language search queries into JSON filters. ' +
            'Respond ONLY with valid JSON: ' +
            '{ keywords, category, location, min_price, max_price }. ' +
            `Return filter values using ${languageLabel} for language code ${lang}.`
        },
        { role: 'user', content: buildUserContent(prompt, cleanedImages) }
      ],
      temperature: 0
    });

    let message = completion.choices[0]?.message?.content || '{}';
    console.log('AI search-ads raw message:', message);

    if (message.trim().startsWith('```')) {
      message = message.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }

    let filters;
    try {
      filters = JSON.parse(message);
    } catch (jsonError) {
      console.error('JSON parse error on search-ads:', jsonError, message);
      return res.status(500).json({ error: tServer(lang, 'aiInvalidJson') });
    }

    const ads = await db.searchAds({
      keywords: filters.keywords || '',
      category: filters.category || '',
      location: filters.location || '',
      min_price: Number.isFinite(filters.min_price) ? filters.min_price : null,
      max_price: Number.isFinite(filters.max_price) ? filters.max_price : null
    });

    const localized = ads.map((ad) => formatAdForLanguage(ad, lang));

    res.json({ ads: localized, filters });
  } catch (error) {
    console.error('Error searching ads with AI', error);
    res.status(500).json({ error: tServer(lang, 'searchAdsError') });
  }
});

/* ------------------------------------------------------
   GET AD BY ID
------------------------------------------------------ */
app.get('/api/ads/:id', async (req, res) => {
  const lang = resolveLanguage(null, req);
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  try {
    const ad = await db.incrementAdVisits(adId);
    if (!ad) {
      return res.status(404).json({ error: tServer(lang, 'adNotFound') });
    }

    const localized = formatAdForLanguage(ad, lang);

    res.json({ ad: localized });
  } catch (error) {
    console.error('Error fetching ad', error);
    res.status(500).json({ error: tServer(lang, 'fetchAdError') });
  }
});

/* ------------------------------------------------------
   REPORT AD
------------------------------------------------------ */
app.post('/api/ads/:id/report', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  try {
    const ad = await db.getAdById(adId);
    if (!ad) {
      return res.status(404).json({ error: tServer(lang, 'adNotFound') });
    }

    const reason = (req.body?.reason || '').toString().slice(0, 500);
    console.log(`Ad ${adId} reported`, reason ? `Reason: ${reason}` : 'No reason provided');
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting ad', error);
    res.status(500).json({ error: tServer(lang, 'fetchAdError') });
  }
});

/* ------------------------------------------------------
   AUTH STUBS
------------------------------------------------------ */
app.post('/api/auth/register', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: tServer(lang, 'authMissingFields') });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: tServer(lang, 'authInvalidEmail') });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: tServer(lang, 'authPasswordLength') });
  }

  try {
    const user = await db.registerUser({ email, password });
    res.json({ success: true, message: tServer(lang, 'authRegistrationSuccess'), user });
  } catch (error) {
    console.error('Register error', error);
    const errorKey = error.message?.includes('Email already registered')
      ? 'authEmailExists'
      : 'authRegistrationFailed';
    res.status(400).json({ error: tServer(lang, errorKey) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: tServer(lang, 'authMissingFields') });
  }

  try {
    const user = await db.loginUser({ email, password });
    res.json({ success: true, message: tServer(lang, 'authLoginSuccess'), user });
  } catch (error) {
    console.error('Login error', error);
    const errorKey = error.message?.includes('Invalid email or password')
      ? 'authInvalidCredentials'
      : 'authLoginFailed';
    res.status(400).json({ error: tServer(lang, errorKey) });
  }
});

/* ------------------------------------------------------
   START SERVER
------------------------------------------------------ */
app.listen(port, () => {
  console.log(`SpeedList server running at http://localhost:${port}`);
});
