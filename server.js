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

db
  .seedAdsForCategories(categories)
  .then((created) => {
    if (created > 0) {
      console.log(`Seeded ${created} ads to reach 30 per category.`);
    }
  })
  .catch((err) => {
    console.error('Failed to seed ads', err);
  });

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ------------------------------------------------------
   GET RECENT ADS
------------------------------------------------------ */
app.get('/api/ads/recent', async (req, res) => {
  try {
    const ads = await db.getRecentAds(10);
    res.json({ ads });
  } catch (error) {
    console.error('Error fetching recent ads', error);
    res.status(500).json({ error: 'Failed to fetch recent ads' });
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
  const { prompt, images = [] } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const cleanedImages = sanitizeImages(images);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },   // <== FORCE JSON
      messages: [
        {
          role: 'system',
          content:
            'You convert natural language into structured classified ads. ' +
            'Respond ONLY with valid JSON with keys: title (string), description (string), ' +
            'category (string), location (string), price (number or null).'
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
      return res.status(500).json({ error: 'AI response was not valid JSON' });
    }

    if (!adData.title || !adData.description) {
      return res.status(400).json({ error: 'AI did not return required ad fields' });
    }

    const saved = await db.createAd({
      title: adData.title,
      description: adData.description,
      category: adData.category || '',
      location: adData.location || '',
      price: typeof adData.price === 'number' ? adData.price : null,
      images: cleanedImages
    });

    res.json({ ad: saved });
  } catch (error) {
    console.error('Error creating ad with AI', error);
    res.status(500).json({ error: 'Failed to create ad with AI' });
  }
});

/* ------------------------------------------------------
   SEARCH ADS USING AI
------------------------------------------------------ */
app.post('/api/ai/search-ads', async (req, res) => {
  const { prompt, images = [] } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const cleanedImages = sanitizeImages(images);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Convert natural language search queries into JSON filters. ' +
            'Respond ONLY with valid JSON: ' +
            '{ keywords, category, location, min_price, max_price }.'
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
      return res.status(500).json({ error: 'AI response was not valid JSON' });
    }

    const ads = await db.searchAds({
      keywords: filters.keywords || '',
      category: filters.category || '',
      location: filters.location || '',
      min_price: Number.isFinite(filters.min_price) ? filters.min_price : null,
      max_price: Number.isFinite(filters.max_price) ? filters.max_price : null
    });

    res.json({ ads, filters });
  } catch (error) {
    console.error('Error searching ads with AI', error);
    res.status(500).json({ error: 'Failed to search ads with AI' });
  }
});

/* ------------------------------------------------------
   GET AD BY ID
------------------------------------------------------ */
app.get('/api/ads/:id', async (req, res) => {
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: 'Invalid ad id' });
  }

  try {
    const ad = await db.getAdById(adId);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ ad });
  } catch (error) {
    console.error('Error fetching ad', error);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
});

/* ------------------------------------------------------
   AUTH STUBS
------------------------------------------------------ */
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const user = await db.registerUser({ email, password });
    res.json({ success: true, message: 'Account created. You are now signed in.', user });
  } catch (error) {
    console.error('Register error', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.loginUser({ email, password });
    res.json({ success: true, message: 'Login successful.', user });
  } catch (error) {
    console.error('Login error', error);
    res.status(400).json({ error: error.message || 'Login failed' });
  }
});

/* ------------------------------------------------------
   START SERVER
------------------------------------------------------ */
app.listen(port, () => {
  console.log(`SpeedList server running at http://localhost:${port}`);
});
