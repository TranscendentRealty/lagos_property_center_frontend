// components/user/search/SearchPageClientWrapper.tsx
'use client'

import React, { useState, useEffect, useCallback, Children } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // <-- The new App Router hooks
import FiltersSidebar, { Filters } from './FiltersSidebar';
import SearchBarAndSort, { SortOption } from './SearchBarAndSort';
import PropertyResultsGrid from './PropertyResultsGrid';
import { IPagination, IProperty } from '@/types/property';
import httpClient from '@/services/httpClient';
import { IPaginatedProperties } from '@/types/property';
import ReactPaginate from 'react-paginate';
import { availableLocations } from '@/exports/constants';

// Props for our client wrapper
interface SearchPageClientWrapperProps {
  initialProperties: IProperty[];
  initialPagination: IPagination | null;
  searchParams: { [key: string]: string | string[] | undefined };
  children: React.ReactNode
}

// This function will now be used for CLIENT-SIDE fetching
const fetchClientSideProperties = async (
  queryString: string,
  page: number,
  limit: number = 10
): Promise<IPaginatedProperties> => {
  try {
    // console.log({ searchQueryString: queryString });
    const url = `/api/v1/properties/search?${queryString}&page=${page}&limit=${limit}`;

    const response = await httpClient.get(url);
    if (response.data?.status === 'success') {
      return response.data.data;
    }
    return { properties: [] };
  } catch (error) {
    console.error("Client-side fetch failed:", error);
    return { properties: [] };
  }
};

const SearchPageClientWrapper: React.FC<SearchPageClientWrapperProps> = ({
  initialProperties,
  initialPagination,
  searchParams: initialSearchParams,
  children
}) => {
  const router = useRouter();
  const pathname = usePathname();
  // --- STATE MANAGEMENT ---
  const [properties, setProperties] = useState<IProperty[]>(initialProperties);
  const [pagination, SetPagination] = useState<IPagination | null>(initialPagination);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Initialize state from the server-passed searchParams
  // Let's align the state names more closely with the API expectations
  const [filters, setFilters] = useState<Filters>({
    keywords: (initialSearchParams.search as string)?.split(',') || [],
    maxPrice: Number(initialSearchParams['price[lte]']) || 5_000_000_000,
    location: (initialSearchParams.location as string) || '',
    propertyType: (initialSearchParams.propertyType as string) || '',
    bedrooms: (initialSearchParams.bedrooms as string) || '',
  });

  // This is the general text search from the search bar
  const [searchQuery, setSearchQuery] = useState((initialSearchParams.search as string) || '');

  // Sorting state — map URL-stored UI values back to SortOption; anything else (including
  // legacy API values like '-createdAt') falls through to the default 'recommended'.
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const urlSort = initialSearchParams.sort as string;
    if (urlSort === 'price_asc') return 'price_asc';
    if (urlSort === 'price_desc') return 'price_desc';
    return 'recommended';
  });

  // const availableLocations = ['Lekki Phase 1', 'Chevron', 'Ikate', 'Ologolo', 'Osapa', 'Idado', 'Lekki Conservation Road', 'Ikota', 'VGC', 'Orchid Road']; // This could also be fetched from the backend for dynamic location lists

  // --- REFACTORED URL UPDATE & DATA FETCHING LOGIC ---
  useEffect(() => {
    setSearchQuery(prev => {
      // let newSearchParam = initialSearchParams.search ? (initialSearchParams.search as string) : '';


      // if (initialSearchParams.search && initialSearchParams.search !== prev) {
      //   newSearchParam = initialSearchParams.search as string;
      // }

      // if (filters.location && filters.location !== prev) {
      //   newSearchParam = filters.location;
      // }

      // return newSearchParam;

      return initialSearchParams.search && initialSearchParams.search !== prev
        ? (initialSearchParams.search as string)
        : prev;

    });

    // Create a new URLSearchParams object. This class handles encoding automatically.
    const params = new URLSearchParams();

    // 1. Handle `keywords` from the search bar and filter sidebar
    // We combine the general search query with the specific keyword tags from the filter
    const allKeywords = [
      // ...filters.keywords,
      // Add the main search query if it's not already in the keywords array
      // ...(searchQuery.trim() && !filters.keywords.includes(searchQuery.trim()) ? [searchQuery.trim()] : [])

      ...(searchQuery.trim() ? [searchQuery.trim()] : [])
    ];

    // setFilters(prev => ({
    //   ...prev,
    //   keywords: allKeywords
    // }));

    if (allKeywords.length > 0) {
      // Your backend expects a single comma-separated string for 'keywords'
      params.set('search', allKeywords.join(','));
    }

    // 2. Handle advanced filtering for `price`
    // Your backend expects a format like: price[lte]=500000000
    if (filters.maxPrice) {
      params.set('price[lte]', filters.maxPrice.toString());
    }

    // 3a. Property type and bedrooms filters from sidebar
    // Note: location is handled via searchQuery (search param) since the backend
    // prioritises `search` over `location.city` when both are present.
    if (filters.propertyType) params.set('propertyType', filters.propertyType);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);

    // 3. Handle `sort`
    // Store the UI sort option in the URL (human-readable, restores correctly on page load).
    // Build a separate API queryString with the backend-expected sort value.
    params.set('sort', sortOption);

    const apiSortMap: Record<SortOption, string> = {
      price_asc: 'price',
      price_desc: '-price',
      recommended: '-createdAt',
    };
    const apiParams = new URLSearchParams(params.toString());
    apiParams.set('sort', apiSortMap[sortOption]);

    // --- URL and Fetching Logic ---
    const urlQueryString = params.toString();
    const apiQueryString = apiParams.toString();

    // Use `replace` instead of `push` to avoid cluttering browser history on every filter change.
    const searchUrl = `${pathname}?${urlQueryString}`;
    // console.log({ searchUrl });
    router.replace(searchUrl, { scroll: false });

    const fetchData = async () => {
      setLoading(true);
      const result = await fetchClientSideProperties(apiQueryString, currentPage);
      setProperties(result.properties);
      SetPagination(result.pagination ?? null);
      setLoading(false);
    };

    const handler = setTimeout(() => {
      fetchData();
    }, 500);

    return () => {
      clearTimeout(handler);
    };

  }, [searchQuery, sortOption, router, pathname, currentPage, filters, initialSearchParams.search]);


   useEffect(() => {
    setSearchQuery(filters.location);
   }, [filters.location])



  // useUpdateEffect(() => {
  //   setSearchQuery(prev => {
  //     return initialSearchParams.search ? (initialSearchParams.search as string) : prev
  //   });

  //   setFilters(prev => {
  //     return {
  //       ...prev,
  //       keywords: []
  //     }
  //   })
  // }, [filters, searchQuery, sortOption, router, pathname])

  // --- Handler functions ---
  const handleFilterChange = (newFilters: Filters) => {
    // When the location dropdown changes, drive searchQuery so the `search` param
    // (which the backend prioritises) reflects the selected location.
    // console.log({ newLocation: newFilters.location });
    // console.log({ currentFilterLocation: filters.location });

    if (newFilters.location !== filters.location) {
      // console.log("Updating searchQuery to match new location...");
      setSearchQuery(newFilters.location);
    }
    // console.log({ afterQueryUpdate: newFilters.location });

    setFilters(newFilters);
  };
  const handleSearch = (query: string) => setSearchQuery(query);
  const handleSortChange = (newSortOption: SortOption) => setSortOption(newSortOption);

  const handlePageChange = (selectedItem: { selected: number }) => {
    // react-paginate is 0-indexed, our API is likely 1-indexed
    const newPage = selectedItem.selected + 1;
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="row">
      <div className="col-lg-3 col-md-4 mb-4 mb-md-0">
        <FiltersSidebar
          initialFilters={filters}
          availableLocations={availableLocations}
          onFilterChange={handleFilterChange}
          onApply={() => {
            document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>

      <div className="col-lg-9 col-md-8" id="search-results">
        <SearchBarAndSort
          initialSearchQuery={searchQuery}
          initialSortOption={sortOption}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
        />
        {/* {children } */}
        <PropertyResultsGrid properties={properties} loading={loading} />

        {/* --- ReactPaginate Component --- */}
        {pagination && pagination?.total > 1 && (
          <ReactPaginate
            previousLabel={'< Prev'}
            nextLabel={'Next >'}
            breakLabel={'...'}
            pageCount={pagination?.totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageChange}
            containerClassName={'pagination justify-content-center mt-5'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            activeClassName={'active'}
            forcePage={currentPage - 1} // 0-indexed current page
          />
        )}
      </div>
    </div>
  );
};

export default SearchPageClientWrapper;