/*
  Lightweight prompt evaluation runner for SpeedList.
  Usage: OPENAI_API_KEY=... npm run eval:ai
*/

const OpenAI = require('openai').default;
const {
  buildCreateAdSystemPrompt,
  buildSearchSystemPrompt,
  getCreateAdFewShot,
  getSearchFewShot,
  validateAdDraft,
  validateSearchFilters
} = require('../ai/prompting');

function buildUserContent(text) {
  return [{ type: 'text', text }];
}

async function runCreateScenario(client, lang, prompt) {
  const messages = [
    { role: 'system', content: buildCreateAdSystemPrompt(lang) },
    ...getCreateAdFewShot(lang),
    { role: 'user', content: buildUserContent(prompt) }
  ];

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.2,
    messages
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(raw);
  const { cleaned, errors } = validateAdDraft(parsed);
  return { raw, cleaned, errors };
}

async function runSearchScenario(client, lang, prompt) {
  const messages = [
    { role: 'system', content: buildSearchSystemPrompt(lang) },
    ...getSearchFewShot(lang),
    { role: 'user', content: buildUserContent(prompt) }
  ];

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0,
    messages
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(raw);
  const cleaned = validateSearchFilters(parsed);
  return { raw, cleaned };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.log('Set OPENAI_API_KEY to run evals.');
    return;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const createPrompts = [
    'Μεταχειρισμένος καναπές γωνιακός σε καλή κατάσταση στη Θεσσαλονίκη, 250 ευρώ',
    'Looking for a plumber in Athens, contact via phone'
  ];

  const searchPrompts = [
    'Cheap smartphones in Athens under 200€',
    'Αγγελίες για ενοικίαση σπιτιού στην Πάτρα μέχρι 650 ευρώ'
  ];

  for (const prompt of createPrompts) {
    const lang = /[Α-Ωα-ω]/.test(prompt) ? 'el' : 'en';
    const result = await runCreateScenario(client, lang, prompt);
    console.log('\n[CREATE]', { prompt, lang, errors: result.errors, draft: result.cleaned });
  }

  for (const prompt of searchPrompts) {
    const lang = /[Α-Ωα-ω]/.test(prompt) ? 'el' : 'en';
    const result = await runSearchScenario(client, lang, prompt);
    console.log('\n[SEARCH]', { prompt, lang, filters: result.cleaned });
  }
}

main().catch((err) => {
  console.error('Evaluation failed', err);
  process.exit(1);
});
