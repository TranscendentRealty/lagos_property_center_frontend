'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactPaginate from 'react-paginate';
import { FaArrowCircleLeft } from 'react-icons/fa';

import httpClient from '@/services/httpClient';
import { IPaginatedProperties, IProperty } from '@/types/property';
import { exploreRoutes, ExploreRouteConfig } from '@/lib/exploreRoutes';
import ExplorePageHero from '@/components/user/explore/ExplorePageHero';
import PropertyCard from '@/components/user/fragments/PropertyCard';
import EmptyStateMessage from '@/components/user/fragments/EmptyStateMessage';


// ---------------------------------------------------------------------------
// Data fetching helpers (mirrors the logic from the original /explore page)
// ---------------------------------------------------------------------------

async function fetchSingleExploreValue(
  category: string,
  value: string,
  page: number,
  limit: number
): Promise<IPaginatedProperties | null> {
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

async function getExploreListings(
  config: ExploreRouteConfig,
  page: number
): Promise<IPaginatedProperties | null> {
  const { category, values, limit } = config;

  if (values.length === 1) {
    return fetchSingleExploreValue(category, values[0], page, limit);
  }

  const responses = await Promise.all(
    values.map(v => fetchSingleExploreValue(category, v.trim(), page, limit))
  );

  const allProperties: IProperty[] = [];
  let combinedTotal = 0;

  for (const result of responses) {
    if (result) {
      allProperties.push(...result.properties);
      combinedTotal += result.pagination?.total ?? 0;
    }
  }

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


// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function getHeader(slug: string, config: ExploreRouteConfig) {
  const value = config.values.join(' / ');
  let headerText: string;

  if (slug === 'available') {
    headerText = 'Browse All Available Property Listings';
  } else if (config.category.startsWith('location.')) {
    headerText = `Browse Available Property Listings that are in ${value}`;
  } else {
    const pluralS = ['apartment', 'terrace'].includes(value.toLowerCase()) ? 's' : '';
    headerText = `Browse Available Property Listings that are ${value}${pluralS}`;
  }

  return <h2 className="section-title fw-bold">{headerText}</h2>;
}


// ---------------------------------------------------------------------------
// Main page content (requires Suspense because of useSearchParams)
// ---------------------------------------------------------------------------

function ExploreSlugContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const config = exploreRoutes[slug];
  const currentPage = parseInt(searchParams.get('page') ?? '1', 10);

  const [paginatedProperties, setPaginatedProperties] = useState<IPaginatedProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) {
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getExploreListings(config, currentPage);
        if (data) {
          setPaginatedProperties(data);
        } else {
          setError('Failed to load listings.');
        }
      } catch (err) {
        setError('An error occurred while fetching data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [slug, currentPage, config]);

  const handlePageChange = (selectedItem: { selected: number }) => {
    const newPage = selectedItem.selected + 1;
    const qs = newPage > 1 ? `?page=${newPage}` : '';
    router.replace(`/explore/${slug}${qs}#explore-categories`);
    window.scrollTo(0, 559);
  };

  const renderListings = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
          <p className="mt-2 text-muted">Loading Properties...</p>
        </div>
      );
    }

    if (error) {
      return <EmptyStateMessage title="Something went wrong" message={error} />;
    }

    if (!paginatedProperties || paginatedProperties.properties.length === 0) {
      return (
        <>
          <Link href="/explore#explore-categories" className="back-button-circle mt-3 mt-md-0 d-inline-block">
            <FaArrowCircleLeft size={35} className="text-black p-0" />
          </Link>
          &nbsp;
          <span className="lead text-muted">Go back to explore more categories</span>
          <EmptyStateMessage
            title="No Properties Found"
            message="Nothing here just yet! Try checking out another category or location."
          />
        </>
      );
    }

    return (
      <div className="mt-3 mt-md-0">
        {getHeader(slug, config)}

        <Link href="/explore#explore-categories" className="back-button-circle d-inline-block">
          <FaArrowCircleLeft size={35} className="text-black p-0" />
        </Link>
        &nbsp;
        <span className="lead text-muted my-3 my-md-0">Go back to explore more categories</span>

        <div className="row g-4">
          {paginatedProperties.properties.map((property) => (
            <div
              key={property._id}
              className="col-12 col-sm-6 col-lg-4 d-flex justify-content-center justify-content-md-between"
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {paginatedProperties.pagination && paginatedProperties.pagination.totalPages > 1 && (
          <ReactPaginate
            previousLabel={'< Prev'}
            nextLabel={'Next >'}
            breakLabel={'...'}
            pageCount={paginatedProperties.pagination.totalPages}
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
            forcePage={currentPage - 1}
          />
        )}
      </div>
    );
  };

  // Unknown slug — show the hero + a not-found message
  if (!config) {
    return (
      <main>
        <ExplorePageHero />
        <section className="explore-categories-section py-5 mt-5 mt-lg-0" id="explore-categories">
          <div className="container" style={{ maxWidth: '1200px' }}>
            <EmptyStateMessage
              title="Page Not Found"
              message="This explore page doesn't exist. Try browsing our available categories."
            />
            <div className="mt-4">
              <Link href="/explore" className="btn btn-primary">Back to Explore</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <ExplorePageHero />
      <section className="explore-categories-section py-5 mt-5 mt-lg-0" id="explore-categories">
        <div className="container" style={{ maxWidth: '1200px' }}>
          {renderListings()}
        </div>
      </section>
    </main>
  );
}


// ---------------------------------------------------------------------------
// Page export — Suspense required by Next.js for useSearchParams
// ---------------------------------------------------------------------------

export default function ExploreSlugPage() {
  return (
    <Suspense
      fallback={
        <main>
          <section className="explore-categories-section py-5">
            <div className="container text-center py-5">
              <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
            </div>
          </section>
        </main>
      }
    >
      <ExploreSlugContent />
    </Suspense>
  );
}
