'use client'

// components/FiltersSidebar.tsx
import React, { useState } from 'react';
import { Form, Badge } from 'react-bootstrap';

export interface Filters {
  keywords: string[];
  maxPrice: number;
  location: string;
  propertyType: string;
  bedrooms: string;
}

interface FiltersSidebarProps {
  initialFilters: Filters;
  availableLocations: string[];
  onFilterChange: (filters: Filters) => void;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  initialFilters,
  availableLocations,
  onFilterChange,
}) => {
  const [keywords, setKeywords] = useState<string[]>(initialFilters.keywords);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters.maxPrice);
  const [location, setLocation] = useState<string>(initialFilters.location);
  const [propertyType, setPropertyType] = useState<string>(initialFilters.propertyType);
  const [bedrooms, setBedrooms] = useState<string>(initialFilters.bedrooms);

  const emit = (patch: Partial<Filters>) => {
    onFilterChange({ keywords, maxPrice, location, propertyType, bedrooms, ...patch });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value, 10);
    setMaxPrice(newPrice);
    emit({ maxPrice: newPrice });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    setKeywords(newLocation ? [newLocation] : []); // Sync keywords with location for now
    emit({ location: newLocation, keywords: newLocation ? [newLocation] : [] });
  };

  const handlePropertyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setPropertyType(newType);
    emit({ propertyType: newType });
  };

  const handleBedroomsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBedrooms = e.target.value;
    setBedrooms(newBedrooms);
    emit({ bedrooms: newBedrooms });
  };

  return (
    <div className="filters-sidebar card shadow-sm">
      <div className="card-body">
        {/* Keywords */}
        <div className="mb-4 filter-section">
          <h6 className="filter-title fw-semibold mb-2">Keywords</h6>
          {keywords.length > 0 ? (
            keywords.map(keyword => (
              <Badge key={keyword} pill bg="success" className="me-1 mb-1 p-2 keyword-badge">
                {keyword}
                &nbsp;&#10005;
              </Badge>
            ))
          ) : (
            <p className="text-muted small mb-0">No keywords applied.</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-4 filter-section">
          <h6 className="filter-title fw-semibold mb-2">Location</h6>
          <Form.Select value={location} onChange={handleLocationChange}>
            <option value="">All Locations</option>
            {availableLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Form.Select>
        </div>

        {/* Property Type */}
        <div className="mb-4 filter-section">
          <h6 className="filter-title fw-semibold mb-2">Property Type</h6>
          <Form.Select value={propertyType} onChange={handlePropertyTypeChange}>
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="terrace">Terrace</option>
            <option value="semi-detached">Semi-Detached</option>
            <option value="fully detached">Fully Detached</option>
          </Form.Select>
        </div>

        {/* Bedrooms */}
        <div className="mb-4 filter-section">
          <h6 className="filter-title fw-semibold mb-2">Bedrooms</h6>
          <Form.Select value={bedrooms} onChange={handleBedroomsChange}>
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5+</option>
          </Form.Select>
        </div>

        {/* Max Price */}
        {/* <div className="filter-section">
          <h6 className="filter-title fw-semibold mb-2">Max Price</h6>
          <Form.Label htmlFor="maxPriceRange" className="small text-muted">
            Up to ₦{maxPrice.toLocaleString()}
          </Form.Label>
          <Form.Range
            id="maxPriceRange"
            min={50_000_000}
            max={1_500_000_000}
            step={1_000_000}
            value={maxPrice}
            onChange={handleMaxPriceChange}
          />
        </div> */}
      </div>
    </div>
  );
};

export default FiltersSidebar;
