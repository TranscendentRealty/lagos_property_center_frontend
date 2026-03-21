// pages/explore.tsx (or wherever your Explore page is)
'use client';

import { useState, useEffect } from 'react';
import httpClient from '@/services/httpClient';

import ExplorePageHero from '@/components/user/explore/ExplorePageHero';
import ExploreMoreCategories from '@/components/user/explore/ExploreMoreCategories';
import { IPaginatedProperties, IProperty } from '@/types/property';
import useUpdateEffect from '@/hooks/useUpdateEffect';

// Fetches a single location value from the explore API
async function fetchSingleExploreValue(category: string, value: string, page: number, limit: number): Promise<IPaginatedProperties | null> {
  try {
    const url = `/api/v1/pages/explore?category=${category}&value=${value}&page=${page}&limit=${limit}`;
    const response = await httpClient.get(url);
    if (response.data?.status === 'success') return response.data.data as IPaginatedProperties;
    return null;
  } catch (error) {
    console.error(`Exception while fetching explore listings for "${value}":`, error);
    return null;
  }
}

// Fan out one request per value, merge results, deduplicate by _id
async function getExploreListings(category: string, values: string[], page: number, limit: number): Promise<IPaginatedProperties | null> {
  if (values.length === 1) {
    return fetchSingleExploreValue(category, values[0], page, limit);
  }

  const responses = await Promise.all(
    values.map(v => fetchSingleExploreValue(category, v.trim(), page, limit))
  );

  console.log({ exploreCategoryValues: values });

  const allProperties: IProperty[] = [];
  let combinedTotal = 0;

  for (const result of responses) {
    if (result) {
      allProperties.push(...result.properties);
      combinedTotal += result.pagination?.total ?? 0;
    }
  }

  // Deduplicate properties that appear in both location results
  const seen = new Set<string>();
  const uniqueProperties = allProperties.filter(p => {
    if (seen.has(p._id)) return false;
    seen.add(p._id);
    return true;
  });

  return {
    properties: uniqueProperties,
    category,
    value: values.join(' / '),
    pagination: {
      total: combinedTotal,
      limit,
      page,
      totalPages: Math.ceil(combinedTotal / limit),
    },
  };
}



const Explore = () => {
  const [paginatedProperties, setPaginatedProperties] = useState<IPaginatedProperties | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [category, setCategory] = useState("");
  const [categoryValues, setCategoryValues] = useState<string[]>([]);
  const [showListings, setShowListings] = useState(false);



  useUpdateEffect(() => {
    const fetchListings = async () => {
        try {
            setIsLoading(true);
            const data = await getExploreListings(category, categoryValues, currentPage, limit);
            console.log("currentPage:", currentPage);
            if (data) {
              console.log("Fetched listings data:", data);
              setPaginatedProperties(data);
            } else {
                setError("Failed to load listings.");
            }
        } catch (err) {
            setError("An error occurred while fetching data.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    fetchListings();
  }, [currentPage, limit, category, categoryValues]);



  // Callback function for react-paginate
  const handlePageChange = (selectedItem: { selected: number }) => {
    // react-paginate is 0-indexed, our API is likely 1-indexed
    const newPage = selectedItem.selected + 1;
    setCurrentPage(newPage);
    window.scrollTo(0, 559);
  };

  const handleExplore = (category: string, value: string | string[], page: number, limit: number) => {
    const values = Array.isArray(value) ? value.map(v => v.trim()) : [value];
    setCategory(category);
    setCategoryValues(values);
    setCurrentPage(page);
    setLimit(limit);
    setShowListings(true);
  }



  return (
    <main>
      <ExplorePageHero handleExplore={handleExplore}/>
      <ExploreMoreCategories
        listings={paginatedProperties}
        isLoading={isLoading}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        setListings={setPaginatedProperties}
        showListings={showListings}
        setShowListings={setShowListings}
        handleExplore={handleExplore}
      />
    </main>
  );
}

export default Explore;