import React from 'react';
import PropertyCard from '../fragments/PropertyCard';
import { Property } from '@/types/common';
import { IProperty } from '@/types/property';
import EmptyStateMessage from '../fragments/EmptyStateMessage';

interface PropertyResultsGridProps {
  properties: IProperty[];
  loading?: boolean;
  aiSearch?: boolean;
}

const PropertyResultsGrid: React.FC<PropertyResultsGridProps> = ({ properties, loading, aiSearch = false }) => {
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

  if (!properties || properties.length === 0) {
    return (
      <div className='px-3 px-lg-0'>
        <EmptyStateMessage
          title="No Properties Found"
          message="Try adjusting your search filters or keywords." />
      </div>
    );
  }

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