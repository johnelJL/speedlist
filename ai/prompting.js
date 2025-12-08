const categories = require('../categories');

function languageLabel(lang) {
  return lang === 'el' ? 'Greek' : 'English';
}

function summarizeCategories() {
  const summary = categories
    .slice(0, 6)
    .map((cat) => {
      const subs = Array.isArray(cat.subcategories) ? cat.subcategories.slice(0, 3) : [];
      return `${cat.name}: ${subs.join(', ')}`;
    })
    .join('\n- ');

  return summary ? `- Categories we support (sampled): ${summary}` : '';
}

function buildCreateAdSystemPrompt(lang, groundingContext = '') {
  const label = languageLabel(lang);
  const categoryContext = summarizeCategories();
  const sections = [
    'You are SpeedList\'s structured listing generator. You return clean JSON for classifieds, never prose or Markdown.',
    'Rules:',
    '- Always respond with a single JSON object, no code fences.',
    '- Use plain strings, never embed HTML.',
    '- Respect the requested language for every textual field.',
    '- Leave price as null when the user does not state a clear numeric price.',
    '- Infer a realistic category and location from the description when omitted.',
    '- contact_phone and contact_email can be empty strings when not provided.',
    '- visits should default to 0 when not specified.',
    '- Keep descriptions concise (<= 80 words) and specific.',
    `Output schema: { "title": string, "description": string, "category": string, "location": string, "price": number|null, "contact_phone": string, "contact_email": string, "visits": number } using ${label}.`,
    categoryContext ? `Context:\n- ${categoryContext}` : '',
    groundingContext ? `Live marketplace hints:\n${groundingContext}` : ''
  ];

  return sections.filter(Boolean).join('\n');
}

function buildSearchSystemPrompt(lang, groundingContext = '') {
  const label = languageLabel(lang);
  const categoryContext = summarizeCategories();
  const sections = [
    'You convert natural language queries into structured SpeedList filters.',
    'Rules:',
    '- Always respond with a single JSON object, no Markdown.',
    '- Use string values in the requested language for keywords, category, and location.',
    '- Keep keywords short (<= 6 words) and focused on what to search.',
    '- min_price and max_price must be numbers or null; never arrays or strings.',
    '- If the user only mentions a minimum or maximum budget, set the other bound to null.',
    `Output schema: { "keywords": string, "category": string, "location": string, "min_price": number|null, "max_price": number|null } using ${label}.`,
    categoryContext ? `Context:\n- ${categoryContext}` : '',
    groundingContext ? `Live marketplace hints:\n${groundingContext}` : ''
  ];

  return sections.filter(Boolean).join('\n');
}

function getCreateAdFewShot(lang) {
  const label = languageLabel(lang);
  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Vintage bike for sale in Athens, good condition, €180. Email me.' }
      ]
    },
    {
      role: 'assistant',
      content: JSON.stringify({
        title: label === 'Greek' ? 'Παλιά ποδήλατο σε καλή κατάσταση' : 'Vintage bicycle in good condition',
        description:
          label === 'Greek'
            ? 'Ποδήλατο πόλης, καλά συντηρημένο, λειτουργεί άψογα.'
            : 'City bike, well maintained and fully functional.',
        category: label === 'Greek' ? 'Τεχνολογία' : 'Technology',
        location: label === 'Greek' ? 'Αθήνα' : 'Athens',
        price: 180,
        contact_phone: '',
        contact_email: label === 'Greek' ? 'στείλε email' : 'email me',
        visits: 0
      })
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Need a cleaner twice a week in Thessaloniki. No price provided.' }
      ]
    },
    {
      role: 'assistant',
      content: JSON.stringify({
        title: label === 'Greek' ? 'Οικιακή καθαριότητα δύο φορές την εβδομάδα' : 'Home cleaning twice a week',
        description:
          label === 'Greek'
            ? 'Ζητείται έμπειρος/η cleaner για σπίτι στη Θεσσαλονίκη, δύο φορές την εβδομάδα.'
            : 'Looking for an experienced cleaner in Thessaloniki, twice per week.',
        category: label === 'Greek' ? 'Προσωπικές υπηρεσίες' : 'Personal services',
        location: label === 'Greek' ? 'Θεσσαλονίκη' : 'Thessaloniki',
        price: null,
        contact_phone: '',
        contact_email: '',
        visits: 0
      })
    }
  ];
}

function getSearchFewShot(lang) {
  const label = languageLabel(lang);
  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Find cheap laptops in Athens under 400 euros' }
      ]
    },
    {
      role: 'assistant',
      content: JSON.stringify({
        keywords: label === 'Greek' ? 'φθηνά laptop' : 'cheap laptops',
        category: label === 'Greek' ? 'Τεχνολογία' : 'Technology',
        location: label === 'Greek' ? 'Αθήνα' : 'Athens',
        min_price: null,
        max_price: 400
      })
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Looking for pet supplies in Patras, budget at least 30€' }
      ]
    },
    {
      role: 'assistant',
      content: JSON.stringify({
        keywords: label === 'Greek' ? 'είδη κατοικιδίων' : 'pet supplies',
        category: label === 'Greek' ? 'Κατοικίδια & είδη' : 'Pets & supplies',
        location: label === 'Greek' ? 'Πάτρα' : 'Patras',
        min_price: 30,
        max_price: null
      })
    }
  ];
}

function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateAdDraft(raw) {
  const cleaned = {
    title: sanitizeString(raw?.title),
    description: sanitizeString(raw?.description),
    category: sanitizeString(raw?.category),
    location: sanitizeString(raw?.location),
    price: Number.isFinite(Number(raw?.price)) ? Number(raw.price) : null,
    contact_phone: sanitizeString(raw?.contact_phone),
    contact_email: sanitizeString(raw?.contact_email),
    visits: Number.isFinite(Number(raw?.visits)) ? Number(raw.visits) : 0
  };

  const errors = [];
  if (!cleaned.title) errors.push('title');
  if (!cleaned.description) errors.push('description');

  return { cleaned, errors };
}

function validateSearchFilters(raw) {
  return {
    keywords: sanitizeString(raw?.keywords),
    category: sanitizeString(raw?.category),
    location: sanitizeString(raw?.location),
    min_price: Number.isFinite(Number(raw?.min_price)) ? Number(raw.min_price) : null,
    max_price: Number.isFinite(Number(raw?.max_price)) ? Number(raw.max_price) : null
  };
}

module.exports = {
  buildCreateAdSystemPrompt,
  buildSearchSystemPrompt,
  getCreateAdFewShot,
  getSearchFewShot,
  validateAdDraft,
  validateSearchFilters,
  languageLabel
};
