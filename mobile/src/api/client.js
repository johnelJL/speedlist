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
  const normalizedTerm = searchTerm.trim().toLowerCase();
  return ads.filter((ad) => {
    const matchesCategory = categoryName
      ? (ad.category || '').toLowerCase().includes(categoryName.toLowerCase())
      : true;
    const matchesSearch = normalizedTerm
      ? `${ad.title} ${ad.description}`.toLowerCase().includes(normalizedTerm)
      : true;
    return matchesCategory && matchesSearch;
  });
}
