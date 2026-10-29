import SearchResults from './SearchResults';
import { SearchParams, searchQuery } from '@/lib/search';
import { IPaginatedProperties } from '@/types/property';
export default async function SearchResultsPage({ searchParams, ai = false }: { searchParams: SearchParams; ai?: boolean }) {
  let data: IPaginatedProperties = { properties: [] };
  let error = false;
  // Server fetching handles initial loads and navigations without a hydration refetch.
  if (!ai || searchParams.search) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1/properties/${ai ? 'ai-search' : 'search'}?${searchQuery(searchParams)}`, {
        cache: 'no-store', signal: AbortSignal.timeout(18000),
      });
      if (!response.ok) throw new Error('Search unavailable');
      const body = await response.json();
      if (body.status !== 'success' || !Array.isArray(body.data?.properties)) throw new Error('Invalid search response');
      data = body.data;
    } catch { error = true; }
  }
  return <main className="py-4 py-md-5"><div className="container-fluid px-md-4 px-lg-5">
    <SearchResults properties={data.properties} pagination={data.pagination} params={searchParams} ai={ai} error={error} />
  </div></main>;
}
