jest.mock('expo-constants', () => ({
  expoConfig: { extra: { apiBaseUrl: 'https://example.com' } }
}));

jest.mock('axios', () => {
  const create = jest.fn((config) => ({
    ...config,
    get: jest.fn(),
    defaults: config
  }));
  return { create };
});

import * as client from './client';

describe('api client', () => {
  it('builds api base url from expo config', () => {
    expect(client.api.defaults.baseURL).toBe('https://example.com/api');
  });

  it('filters ads by category and search term', async () => {
    const ads = [
      { id: 1, title: 'Red bike', description: 'Fast city bike', category: 'Bikes' },
      { id: 2, title: 'Blue car', description: 'Electric', category: 'Cars' }
    ];
    jest.spyOn(client, 'getRecentAds').mockResolvedValue(ads);
    const results = await client.getAdsByCategory('Cars', 'elect');
    expect(results).toEqual([ads[1]]);
  });
});
