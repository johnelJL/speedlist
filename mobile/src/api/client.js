import axios from 'axios';
import Constants from 'expo-constants';

const baseUrl =
  Constants?.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://localhost:3000';

export const api = axios.create({
  baseURL: `${baseUrl.replace(/\/$/, '')}/api`,
  timeout: 8000
});

const GREEK_PLURAL_SUFFIXES = [
  'ιών',
  'ιων',
  'ων',
  'ους',
  'ων',
  'ες',
  'α',
  'οι',
  'ηδες',
  'ες',
  'ηδες'
];

const SYNONYM_GROUPS = [
  ['ρολόι', 'ρολόγια', 'ρολοι', 'watch', 'watches'],
  ['κινητό', 'κινητά', 'κινητα', 'τηλέφωνο', 'τηλεφωνα', 'smartphone', 'τηλέφωνα'],
  ['αυτοκίνητο', 'αυτοκίνητα', 'αυτοκινητα', 'αμάξι', 'αμαξι', 'όχημα', 'οχημα', 'car', 'cars', 'vehicle'],
  ['ποδήλατο', 'ποδήλατα', 'ποδηλατο', 'ποδηλατα', 'bike', 'bicycle'],
  ['μοτοσυκλέτα', 'μοτοσυκλέτες', 'μοτοσυκλετα', 'μοτοσυκλετες', 'μηχανή', 'μηχανες', 'μηχανήματα', 'moto', 'motorbike'],
  ['υπολογιστής', 'υπολογιστες', 'υπολογιστής', 'pc', 'pcs', 'computer', 'computers', 'desktop'],
  ['laptop', 'laptops', 'notebook', 'notebooks', 'λαπτοπ', 'φορητός', 'φορητοι'],
  ['τηλεόραση', 'τηλεοράσεις', 'τηλεοραση', 'tv', 'television'],
  ['ρούτερ', 'router', 'routers', 'ρουτερ'],
  ['σπίτι', 'σπιτιού', 'οικία', 'οικιακός', 'οικιακα'],
  ['έπιπλο', 'έπιπλα', 'επιπλο', 'επιπλα', 'furniture'],
  ['σκύλος', 'σκύλοι', 'σκυλος', 'σκυλοι', 'σκυλάκι', 'σκυλακι', 'dog', 'dogs'],
  ['γάτα', 'γάτες', 'γατα', 'γατες', 'cat', 'cats']
];

const synonymLookup = SYNONYM_GROUPS.reduce((lookup, group) => {
  const normalizedGroup = group.map((term) => stemGreekToken(normalizeGreekText(term)));
  normalizedGroup.forEach((term) => {
    const existing = lookup.get(term) || new Set();
    normalizedGroup.forEach((peer) => existing.add(peer));
    lookup.set(term, existing);
  });
  return lookup;
}, new Map());

function normalizeGreekText(text = '') {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .replace(/ς/g, 'σ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemGreekToken(token) {
  const suffix = GREEK_PLURAL_SUFFIXES.find(
    (ending) => token.length - ending.length > 2 && token.endsWith(ending)
  );
  return suffix ? token.slice(0, -suffix.length) : token;
}

function tokenizeWithVariants(text) {
  const normalized = normalizeGreekText(text);
  if (!normalized) return new Set();

  return normalized.split(' ').reduce((set, token) => {
    const stemmed = stemGreekToken(token);
    set.add(token);
    set.add(stemmed);

    if (synonymLookup.has(stemmed)) {
      synonymLookup.get(stemmed).forEach((synonym) => set.add(synonym));
    }

    return set;
  }, new Set());
}

export async function getCategories() {
  const response = await api.get('/categories');
  return response.data?.categories || [];
}

export async function getRecentAds(limit = 20) {
  const response = await api.get('/ads/recent', { params: { limit } });
  return response.data?.ads || [];
}

export async function getAdById(id) {
  const response = await api.get(`/ads/${id}`);
  return response.data?.ad;
}

export async function getAdsByCategory(categoryName, searchTerm = '') {
  const ads = await getRecentAds(50);
  const normalizedCategory = normalizeGreekText(categoryName);
  const searchTokens = tokenizeWithVariants(searchTerm);

  return ads.filter((ad) => {
    const adText = `${ad.title} ${ad.description} ${ad.category}`;
    const adTokens = tokenizeWithVariants(adText);

    const matchesCategory = normalizedCategory
      ? tokenizeWithVariants(ad.category).has(normalizedCategory)
      : true;

    const matchesSearch = searchTokens.size
      ? Array.from(searchTokens).every((token) => adTokens.has(token))
      : true;

    return matchesCategory && matchesSearch;
  });
}
