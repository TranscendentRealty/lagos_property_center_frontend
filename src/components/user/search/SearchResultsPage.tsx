import SearchResults from './SearchResults';
import { SearchParams, searchQuery } from '@/lib/search';
import { IPaginatedProperties } from '@/types/property';

export type SearchStatus = 'idle' | 'success' | 'error';

const isCount = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0;

export default async function SearchResultsPage({ searchParams, ai = false }: { searchParams: SearchParams; ai?: boolean }) {
  let data: IPaginatedProperties = { properties: [] };
  // An AI search with no description has not been run yet; it is not an empty result.
  let status: SearchStatus = ai && !searchParams.search ? 'idle' : 'success';
  // Server fetching handles initial loads and navigations without a hydration refetch.
  if (status === 'success') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1/properties/${ai ? 'ai-search' : 'search'}?${searchQuery(searchParams)}`, {
        cache: 'no-store', signal: AbortSignal.timeout(18000),
      });
      if (!response.ok) throw new Error('Search unavailable');
      const body = await response.json();
      // A missing or malformed total is an error, never an invented zero.
      if (body.status !== 'success' || !Array.isArray(body.data?.properties) || !isCount(body.data?.pagination?.total)) throw new Error('Invalid search response');
      data = body.data;
    } catch { status = 'error'; }
  }
  return <main className="py-4 py-md-5"><div className="container-fluid px-md-4 px-lg-5">
    <SearchResults properties={data.properties} pagination={data.pagination} params={searchParams} ai={ai} status={status} />
  </div></main>;
}
