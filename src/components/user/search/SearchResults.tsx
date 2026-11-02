'use client';
import { useEffect, useRef, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IPagination, IProperty } from '@/types/property';
import { SearchParams, searchQuery } from '@/lib/search';
import { trackEvent } from '@/lib/measurement';
import { toBedrooms, toPropertyTypeId } from '@/lib/assistedContact/config';
import FiltersSidebar, { Filters } from './FiltersSidebar';
import PropertyResultsGrid from './PropertyResultsGrid';
import Search from '../layout/Search';
import SearchContactHelp from './SearchContactHelp';
import EmptyStateMessage from '../fragments/EmptyStateMessage';
import AssistedContactOffer from '../assisted-contact/AssistedContactOffer';
import AssistedContactLauncher from '../assisted-contact/AssistedContactLauncher';
import { useAssistedContact } from '../assisted-contact/AssistedContactProvider';
import type { SearchStatus } from './SearchResultsPage';
import { availableLocations } from '@/exports/constants';

export default function SearchResults({ properties, pagination, params, ai = false, status }: {
  properties: IProperty[]; pagination?: IPagination; params: SearchParams; ai?: boolean; status: SearchStatus;
}) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const assist = useAssistedContact();
  const [pending, startTransition] = useTransition();
  const query = searchQuery(params);
  const mode = ai ? 'ai' : 'standard';
  const signature = query.toString();
  const lastResult = useRef('');
  const error = status === 'error';
  useEffect(() => {
    if (status === 'idle') return;
    const key = `${signature}:${status}:${pagination?.total}`;
    if (lastResult.current === key) return;
    lastResult.current = key;
    trackEvent(error ? 'search_error' : 'search_results', { search_mode: mode, result_count: pagination?.total ?? 0, page_number: pagination?.page ?? 1 });
  }, [signature, status, error, pagination?.total, pagination?.page, mode]);
  function navigate(patch: Record<string, string>, resetPage = true) {
    const next = new URLSearchParams(query);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value); else next.delete(key);
    }
    if (resetPage) next.set('page', '1');
    startTransition(() => router.push(`${ai ? '/search-with-ai' : '/search'}?${next}`));
  }
  const filters: Filters = {
    keywords: query.get('search')?.split(',').filter(Boolean) || [], maxPrice: Number(query.get('price[lte]')) || 0,
    location: availableLocations.find(item => item.toLowerCase() === (query.get('location') || query.get('location.city') || '').toLowerCase()) || query.get('location') || query.get('location.city') || '',
    propertyType: query.get('propertyType') || '', bedrooms: query.get('bedrooms') || '',
  };
  function filterChange(next: Filters) {
    navigate({ location: next.location, 'location.city': '', propertyType: next.propertyType, bedrooms: next.bedrooms,
      search: query.get('search')?.toLowerCase() === filters.location.toLowerCase() ? '' : query.get('search') || '' });
  }

  // Offer only the structured filters as shortlist context; never the raw AI description or a price.
  const setPageContext = assist?.setPageContext;
  const contextArea = availableLocations.includes(filters.location) ? filters.location : undefined;
  const contextType = toPropertyTypeId(filters.propertyType);
  const contextBedrooms = toBedrooms(filters.bedrooms);
  useEffect(() => {
    if (!setPageContext) return;
    setPageContext({ source: 'search', pathname, area: contextArea, propertyType: contextType, bedrooms: contextBedrooms, searchMode: mode });
    return () => setPageContext(null);
  }, [setPageContext, pathname, contextArea, contextType, contextBedrooms, mode]);

  const page = pagination?.page || 1;
  const pages = pagination?.totalPages || 0;
  const total = pagination?.total ?? 0;
  const genuineZeroResults = status === 'success' && !pending && total === 0;
  const emptyPage = status === 'success' && !pending && total > 0 && properties.length === 0;

  let empty: React.ReactNode = null;
  if (status === 'idle') {
    empty = <EmptyStateMessage title="Describe the home you want"
      message="Tell us the area, property type and features you have in mind, and we’ll find matching properties." />;
  } else if (emptyPage) {
    empty = <div className="text-center">
      <EmptyStateMessage title="This page has no properties" message="There are fewer results than this page number. Go back to the first page to see them." />
      <button className="btn btn-dark" onClick={() => navigate({ page: '1' }, false)}>Go to page 1</button>
    </div>;
  } else if (genuineZeroResults) {
    empty = <div className="px-3 px-lg-0">
      <EmptyStateMessage title="No Properties Found"
        message={ai ? 'We couldn’t find available properties matching this description. Try different wording, or let us help.'
          : 'We couldn’t find available properties matching this request. Try a different location or property type, or let us help.'} />
      <AssistedContactOffer variant="inline" entryPoint="search_empty" searchMode={mode} />
      <SearchContactHelp />
    </div>;
  }

  return <div className="row" aria-busy={pending}>
    {!ai && <aside className="col-md-4 col-lg-3 mb-4">
      <FiltersSidebar key={signature} initialFilters={filters} availableLocations={availableLocations} onFilterChange={filterChange} />
    </aside>}
    <div className={ai ? 'col-12' : 'col-md-8 col-lg-9'} id="search-results">
      <h1 className="h2">{ai ? 'Find a home that fits' : 'Find your next home'}</h1>
      <Search key={query.get('search') || ''} aiSearch={ai} initialValue={query.get('search') || ''}
        onSearch={value => navigate({ search: value })} pending={pending} />
      <label className="d-block my-3">Sort properties
        <select className="form-select mt-1" style={{ maxWidth: 260 }} value={query.get('sort') || 'recommended'}
          onChange={event => navigate({ sort: event.target.value })} disabled={pending}>
          <option value="recommended">Recommended</option><option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          {query.get('sort') === 'price' && <option value="price">Price: low to high</option>}
          {query.get('sort') === '-price' && <option value="-price">Price: high to low</option>}
        </select>
      </label>
      {error && !pending ? <div role="alert" className="alert alert-warning">
        <p>We couldn’t load your search. Please try again, or contact an agent for help.</p>
        <button className="btn btn-dark" onClick={() => startTransition(() => router.refresh())}>Retry search</button>
        <a href="/search" className="btn btn-link">Use property filters</a>
        <AssistedContactLauncher entryPoint="search_error" className="btn btn-link">Or ask Bukunmi for a shortlist</AssistedContactLauncher>
        <SearchContactHelp />
      </div> : <PropertyResultsGrid properties={properties} loading={pending} aiSearch={ai} empty={empty} />}
      {status === 'success' && pages > 1 && <nav aria-label="Results pages" className="d-flex justify-content-center align-items-center gap-3 my-4">
        <button className="btn btn-outline-dark" disabled={pending || page <= 1} onClick={() => navigate({ page: String(page - 1) }, false)}>Previous</button>
        <span aria-live="polite">Page {page} of {pages}</span>
        <button className="btn btn-outline-dark" disabled={pending || page >= pages} onClick={() => navigate({ page: String(page + 1) }, false)}>Next</button>
      </nav>}
    </div>
  </div>;
}
