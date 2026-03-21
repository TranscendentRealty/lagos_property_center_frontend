'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ReactTyped } from "react-typed";
import httpClient from '@/services/httpClient';

import { icons, images } from '@/exports/images';
import { IPropertiesCount, IProperty } from '@/types/property';


interface IExplorePageHeroProps {
  handleExplore: (category: string, value: string | string[], page: number, limit: number) => void;
}

// Sample data for location cards - pass as props or fetch
const locationTeasers = [
  { id: 1, title: 'Lekki Phase 1 / Ikate', description: 'Explore properties in Lekki Phase 1 and Ikate...' },
  { id: 2, title: 'Osapa / Idado', description: 'Explore properties in Osapa and Idado...' },
  { id: 3, title: 'Chevron / Ologolo', description: 'Explore properties in Chevron and Ologolo...' },
  { id: 4, title: 'Orchid / Lekki Conservation Road', description: 'Explore properties along Orchid and Lekki Conservation Road...' },
  { id: 5, title: 'Ikota / VGC', description: 'Explore properties in Ikota and VGC...' }
];

const headerLocations = [
  'LEKKI PHASE 1',
  'IKATE',
  'OSAPA',
  'IDADO',
  'CHEVRON',
  'OLOGOLO',
  'ORCHID',
  'LEKKI CONSERVATION ROAD',
  'IKOTA',
  'VGC'
];

async function getListingsCount(): Promise<IPropertiesCount | null> {
  try {
    const url = "/api/v1/properties/count"; // Use the relative URL, Axios will use the baseURL you configured
    const response = await httpClient.get(url);

    if (response.data && response.data.status === "success") {
      return response.data.data as IPropertiesCount;
    } else {
      console.warn(`API responded with success=false for listings count.`);
      return null;
    }
  } catch (error) {
    // Axios provides better error objects
    console.error(`Exception during listings fetch with Axios.`, error);
    return null;
  }
}

const ExplorePageHero = ({
  handleExplore
} : IExplorePageHeroProps ) => {
  const backgroundImageUrl = "/images/PropertyImagePlaceholder2.png";
  const subTitlePrefix = "Discover all";
  const listingCount = 99;
  const subTitleSuffix = "listings";
  const locations = locationTeasers;
  const limit = 9;


  const [propertiesCount, setPropertyCount] = useState<IPropertiesCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        // The only change here is that we are confident getListingsCount is using Axios.
        const data = await getListingsCount();
        if (data) {
          setPropertyCount(data);
        } else {
          setError("Failed to load listing counts.");
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const getListingCount = () : string => {
    if (error || !propertiesCount) {
      return '99+';
    }
    return propertiesCount.count.toString();
  };

  return (

    <section>
      <div
        className="page-hero"
        style={{ '--hero-bg-image': `url(${backgroundImageUrl})` }}
      >
        <div className="hero-overlay"></div>
        <div className="container-fluid h-100 d-flex flex-column"> {/* Use container-fluid for full-width content alignment */}

          {/* Main Hero Content - Takes up remaining space and centers its content */}
          <div className="hero-main-content flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center text-white mt-lg-3" data-aos="slide-up" data-aos-ease="ease-in" data-aos-duration="1000">
            <h1 className="hero-title">
              <strong className="text-slider">
                <ReactTyped
                  strings={headerLocations}
                  typeSpeed={80}
                  backDelay={1100}
                  backSpeed={30}
                  loop
                />
              </strong>
            </h1>
            {/* <h1 className="display-1 fw-bold hero-title">{mainTitle}</h1> */}
            <Link href="#explore-categories"
            onClick={() => handleExplore("status", "available", 1, limit)}
            >
              {isLoading ? (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>)
                :
                (<div className="hero-subtitle-link d-inline-flex align-items-center mt-0 mt-lg-2">
                  {subTitlePrefix} {getListingCount()} {subTitleSuffix}
                  &nbsp;&nbsp;
                  <Image src={icons.RightUpArrow} alt='right up arrow' className='' />
                </div>)
              }
            </Link>
          </div>
        </div>


        {/* Location Teaser Cards Area */}
        <div className="location-teasers-container pb-4 pt-3 mb-5 mb-lg-0">
          <div className="row justify-content-center g-2 g-lg-3 align-items-stretch">
            {locations.map((loc) => (
              <div key={loc.id} className="col-6 col-lg location-teaser-card-wrapper">
                <Link href="#explore-categories"
                 onClick={() => handleExplore("location.street", loc.title.split('/').map(s => s.trim()), 1, limit)}
                 className="h-100 d-block text-decoration-none"
                >
                  <div className="card location-teaser-card h-100" data-aos="flip-up" data-aos-ease="ease-in" data-aos-duration="1200">
                    <div className="card-body text-center d-flex flex-column justify-content-center">
                      <h5 className="card-title fw-semibold">{loc.title}</h5>
                      <p className="card-text small text-muted mb-0">{loc.description}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ExplorePageHero;