export type SearchParams = Record<string, string | string[] | undefined>;
export const SEARCH_PAGE_SIZE = 12;
const keys = ['search', 'location', 'location.city', 'propertyType', 'propertySubtype', 'bedrooms', 'bedroomMode', 'listingType', 'price[gte]', 'price[lte]', 'price[gt]', 'price[lt]', 'minPrice', 'maxPrice', 'sort', 'page'];
export function searchQuery(input: SearchParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of keys) {
    const value = input[key];
    if (typeof value === 'string' && value.trim()) params.set(key, value.trim());
  }
  params.set('limit', String(SEARCH_PAGE_SIZE));
  return params;
}
