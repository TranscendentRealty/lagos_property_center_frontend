'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import FiltersSidebar, { Filters } from '@/components/user/search/FiltersSidebar';
import { availableLocations } from '@/exports/constants';

const emptyFilters: Filters = {
    keywords: [],
    maxPrice: 5_000_000_000,
    location: '',
    propertyType: '',
    bedrooms: '',
};

const ListingPageSidebar = () => {
    const router = useRouter();

    const handleFilterChange = (filters: Filters) => {
        const params = new URLSearchParams();
        // Location drives the search keyword (consistent with search page behaviour)
        if (filters.location) params.set('search', filters.location);
        if (filters.propertyType) params.set('propertyType', filters.propertyType);
        if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);

        const qs = params.toString();
        if (qs) router.push(`/search?${qs}`);
    };

    return (
        <FiltersSidebar
            initialFilters={emptyFilters}
            availableLocations={availableLocations}
            onFilterChange={handleFilterChange}
        />
    );
};

export default ListingPageSidebar;
