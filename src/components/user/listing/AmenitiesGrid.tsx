// components/AmenitiesGrid.tsx
import React from 'react';
// Import specific amenity icons
import { FaBed, FaCouch, FaBath, FaSwimmingPool, FaDumbbell } from 'react-icons/fa'; // Example general icons
import { MdElevator } from 'react-icons/md';
import { HiHomeModern } from 'react-icons/hi2';
import { GiCctvCamera } from "react-icons/gi";
import { GiFilmProjector } from "react-icons/gi";

// You might need more specific icons like: GiBathtub, GiHomeGarage, MdOutlineOutdoorGrill etc.

export interface Amenity {
  id: string;
  icon?: React.ReactNode; // Allow passing any JSX element as icon
  text: string;
}

interface AmenitiesGridProps {
  amenities: Amenity[];
}

const keyAmenities = [
  'bedroom',
  'living room',
  'bath',
  'swimming pool',
  'gym',
  'elevator',
  'inbuilt speakers',
  'fitted kitchen',
  'cctv',
  'cinema'
]

// Example: Create a helper to map text to icons if needed, or pass icons directly
const getAmenityIcon = (text: string): React.ReactNode => {
  if (text.toLowerCase().includes('bedroom')) return <FaBed size={20} className="text-black" />;
  if (text.toLowerCase().includes('living room')) return <FaCouch size={20} className="text-black" />;
  if (text.toLowerCase().includes('bath')) return <FaBath size={20} className="text-black" />;
  if (text.toLowerCase().includes('swimming pool')) return <FaSwimmingPool size={20}
    className="text-black" />;
  if (text.toLowerCase().includes('gym')) return <FaDumbbell size={20} className="text-black" />;
  if (text.toLowerCase().includes('elevator')) return <MdElevator size={20} className="text-black" />;
  if (text.toLowerCase().includes('cctv')) return <GiCctvCamera size={20} className="text-black" />;
  if (text.toLowerCase().includes('cinema')) return <GiFilmProjector size={20} className="text-black" />;

  return <HiHomeModern size={20} className="text-black" />;
};


const AmenitiesGrid: React.FC<AmenitiesGridProps> = ({ amenities }) => {
  if (!amenities || amenities.length === 0) return null;

  // console.log("Amenities passed to AmenitiesGrid:", amenities);

  return (
    <div className="amenities-grid-section">
      <h4 className="mb-3 fw-semibold section-subtitle">Key Features & Amenities</h4>
      <div className="row g-3">
        {amenities.map(amenity => {
          const normalizedAmenity = amenity.text.toLowerCase();

          // .find() returns the actual matched string (e.g., 'bedroom') instead of just true/false
          const matchedKey = keyAmenities.find(key => normalizedAmenity.includes(key));

          if (matchedKey) {
            amenity.icon = getAmenityIcon(matchedKey);

            return (
              <div key={amenity.id} className="col-md-6 col-lg-6"> {/* 2 per row on md/lg */}
                <div className="amenity-item card card-body h-100 flex-row align-items-center p-2 shadow-sm">
                  <div className="amenity-icon me-2 flex-shrink-0">
                    {amenity.icon}
                  </div>
                  <p className="amenity-text mb-0 small">{amenity.text}</p>
                </div>
              </div>)
          }


        })}
      </div>
    </div>
  );
};

export default AmenitiesGrid;