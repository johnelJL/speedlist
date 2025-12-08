import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getAdById, getAdsByCategory, getCategories } from './client';

const PAGE_SIZE = 6;

export function useCategories() {
  return useInfiniteQuery({
    queryKey: ['categories'],
    queryFn: async ({ pageParam = 0 }) => {
      const data = await getCategories();
      const start = pageParam * PAGE_SIZE;
      return {
        items: data.slice(start, start + PAGE_SIZE),
        hasMore: start + PAGE_SIZE < data.length
      };
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length : undefined
  });
}

export function useCategoryItems(categoryName, searchTerm) {
  return useQuery({
    queryKey: ['category', categoryName, searchTerm],
    queryFn: () => getAdsByCategory(categoryName, searchTerm)
  });
}

export function useAd(adId) {
  return useQuery({
    queryKey: ['ad', adId],
    queryFn: () => getAdById(adId),
    enabled: Boolean(adId)
  });
}
