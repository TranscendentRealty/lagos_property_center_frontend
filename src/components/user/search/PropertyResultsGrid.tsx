import React from 'react';
import PropertyCard from '../fragments/PropertyCard';
import { IProperty } from '@/types/property';

interface PropertyResultsGridProps {
  properties: IProperty[];
  loading?: boolean;
  aiSearch?: boolean;
  // The parent decides what an empty grid means (not yet searched, genuinely no matches, or an empty page).
  empty?: React.ReactNode;
}

const PropertyResultsGrid: React.FC<PropertyResultsGridProps> = ({ properties, loading, aiSearch = false, empty = null }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading properties...</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) return <>{empty}</>;

  return (
    <div className="row g-4 property-results-grid mx-0">
      {properties.map(property => (
        <div key={property._id} className={`col-12 col-lg-${aiSearch ? '4' : '6'} d-flex justify-content-center`}>
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
};

export default PropertyResultsGrid;
