const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require("openai").default; // IMPORTANT FIX
const db = require('./db');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));

db.init();

// OpenAI client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
   CREATE AD USING AI
------------------------------------------------------ */
app.post('/api/ai/create-ad', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Convert natural language into structured classified ads. ' +
            'Respond ONLY with valid JSON containing: title, description, category, location, price.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    const message = completion.choices[0]?.message?.content || '';
    let adData;

    try {
      adData = JSON.parse(message);
    } catch (jsonError) {
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
      price: typeof adData.price === 'number' ? adData.price : null
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
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Convert natural language into search filters. " +
            "Respond ONLY with valid JSON: { keywords, category, location, min_price, max_price }"
        },
        { role: "user", content: prompt }
      ],
      temperature: 0
    });

    const message = completion.choices[0]?.message?.content || '{}';

    let filters;

    try {
      filters = JSON.parse(message);
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError, message);
      return res.status(500).json({ error: "AI response was not valid JSON" });
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
   AUTH STUBS
------------------------------------------------------ */
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, message: 'Login stub - authentication coming soon.' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: 'Register stub - authentication coming soon.' });
});

/* ------------------------------------------------------
   START SERVER
------------------------------------------------------ */
app.listen(port, () => {
  console.log(`SpeedList server running at http://localhost:${port}`);
});
