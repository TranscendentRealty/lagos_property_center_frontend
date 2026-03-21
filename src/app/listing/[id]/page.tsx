// app/products/[id]/page.tsx

import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import ScrollToTop from '@/components/user/fragments/ScrollToTop';

// Import UI Components
import ImageGallery, { GalleryImage } from '../../../components/user/listing/ImageGallery';
import ProductInfo from '../../../components/user/listing/ProductInfo';
import AgentCard from '../../../components/user/listing/AgentCard';
import ProductDescription from '@/components/user/listing/ProductDescription';
import SimilarListings from '@/components/user/listing/SimilarListings';
import { Button } from 'react-bootstrap';
import { IProperty } from '@/types/property'; // Assuming you have this type defined
import AmenitiesGrid, { Amenity } from '@/components/user/listing/AmenitiesGrid';

// New listings created after a build render on-demand and are then cached.
export const dynamicParams = true;

// Revalidate every 12 hours so price/status changes eventually propagate without a full rebuild.
export const revalidate = 43200;

// --- STATIC PARAMS (SSG) ---
// Called at build time. Next.js pre-renders one page per returned id.
export async function generateStaticParams(): Promise<{ id: string }[]> {
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiBaseUrl}/api/v1/properties/all`, { cache: 'force-cache' });

        if (!res.ok) {
            console.error(`generateStaticParams: API error ${res.status}`);
            return [];
        }

        const data = await res.json();
        const properties: { _id: string }[] = data?.data?.properties ?? [];
        return properties.map((p) => ({ id: p._id }));
    } catch (error) {
        console.error('generateStaticParams: failed to fetch property list', error);
        return [];
    }
}

// --- DATA FETCHING FUNCTION ---
async function getListingDetails(id: string): Promise<IProperty | null> {
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
        const url = `${apiBaseUrl}/api/v1/properties/${id}`;

        // force-cache: Next.js serves the cached (statically generated) version and revalidates
        // in the background per the revalidate interval set above.
        const res = await fetch(url, { cache: 'force-cache' });

        // If the request itself fails (e.g., network error, 404 from API), handle it.
        if (!res.ok) {
            console.error(`API Error: Failed to fetch listing ${id}, status: ${res.status}`);
            return null;
        }

        const responseData = await res.json();

        // Check for the success flag from your API's response structure.
        if (!responseData.success) {
            console.warn(`API responded with success=false for listing ${id}`);
            return null;
        }

        return responseData.data as IProperty;
    } catch (error) {
        console.error(`Exception during fetch for listing ${id}:`, error);
        return null;
    }
}


async function getSimilarListings(propertyId: string) {
    try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
        const url = `${apiBaseUrl}/api/v1/properties/${propertyId}/similar`;


        // Inherits the page-level revalidate = 43200 (12h). Using a shorter value here
        // would silently override the page-level setting and cause hourly ISR rebuilds.
        const res = await fetch(url, { cache: 'force-cache' });

        if (!res.ok) {
            // This will be caught by the nearest error.js file.
            throw new Error(`Failed to fetch agent listings data: ${res.statusText}`);
        }

        const data = await res.json();

        // Assuming your API returns { success: true, data: { propertiesOfTheWeek: [], hotProperties: [] } }
        if (data.status === 'success') {
            return data.data; // Return the nested data object
        } else {
            console.warn('API indicated a failure:', data.message);
            return { properties: [] };
        }
    } catch (error) {
        // Handle network errors or other fetch-related issues.
        console.error("Error in getHomepageData:", error);
        // In case of an error, we return a default empty state to prevent the page from crashing.
        return { properties: [] };
    }
}


// --- DYNAMIC METADATA (App Router way) ---
export async function generateMetadata(
    { params }: { params: { id: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const product = await getListingDetails(id);

    if (!product) {
        return {
            title: 'Property Not Found',
        };
    }

    // product.photos.sort((a, b) => {
    //     return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    // });

    const mainImageUrl = product.photos?.[0] || '/images/PropertyImagePlaceholder.png';

    return {
        title: `${product.title}`,
        description: product.description || `Details for ${product.title}, located in ${product.location.street}.`,
        openGraph: {
            title: `${product.title} | Transcendent Realty`,
            images: [
                {
                    url: mainImageUrl, // Dynamically injects the R2 image!
                      width: 900,
                      height: 1200,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            images: [mainImageUrl],
        }
    };
}


// --- SERVER COMPONENT PAGE ---
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const product = await getListingDetails(id);
    const similarListings = await getSimilarListings(id);
    // console.log("Similar Listings:", similarListings);

    if (!product) {
        notFound();
    }

    // product.photos.sort((a, b) => {
    //     return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    // });

    // --- Data Transformation for Child Components ---
    // It's good practice to map your raw API data to the props your components expect.
    const galleryImagesForComponent: GalleryImage[] = product.photos.map((photo, index) => ({
        id: `img-${index}`,
        src: photo,
        alt: product.title, // Use a descriptive alt text
        type: 'image', // Add logic here if you support videos
    }));

    if (product.videoUrls?.bucket) {
        galleryImagesForComponent.push({
            id: 'video_1',
            src: product.photos[0],
            alt: product.title,
            type: 'video',
            videoType: 'html',
            videoSrc: product.videoUrls.bucket,
        });
    } else if (product.videoUrls?.youtube) {
        galleryImagesForComponent.push({
            id: 'video_1',
            src: product.photos[0],
            alt: product.title,
            type: 'video',
            videoType: 'youtube',
            videoSrc: product.videoUrls.youtube,
        });
    }

    const amenitiesForGrid: Amenity[] = product.amenities.map((amenity, idx) => ({
        id: `amenity-${idx}`,
        text: amenity,
    }))

    // const tagsForComponent = product.amenities || [];

    return (
        <> {/* Or your main <Layout> component */}
            <ScrollToTop />
            <main className="container py-4 py-md-5"> {/* Use a standard container */}
                <div className="row g-4 g-lg-5">
                    <div className="col-lg-7 col-md-12">
                        {/* Pass the transformed data to the Client Component */}
                        <ImageGallery galleryImages={galleryImagesForComponent} />
                    </div>

                    <div className="col-lg-5 col-md-12 product-details-column">
                        <ProductInfo
                            title={product.title}
                            tags={product.amenities}
                            price={product.price.toLocaleString()} // Format the price nicely
                            location={`${product.location.street}, ${product.location.city}`}
                        />

                        {/*
              AgentCard will need data. Assuming agent info is in `product.creator`
              Make sure your IProperty type includes a creator object with these fields.
            */}
                        {product.creator && (
                            <AgentCard
                                agentName={`${product.creator.name}`}
                                agentTitle={`Lead Agent — ${product.agency.name}`}
                                agentImageUrl={product.creator.avatar || '/images/default_avatar.jpg'}
                                rating={4.5} // This data needs to come from your API
                            />
                        )}

                        <div className="my-3 d-grid"> {/* d-grid makes button full-width */}
                            <Button variant="dark" size="lg" className="book-tour-btn" href={product.creator.calendlyLink} target='_blank'>
                                Book A Tour
                            </Button>
                        </div>

                        {/*
              AmenitiesGrid would also need a mapping from product.features.
              For now, let's assume it's covered by the tags in ProductInfo.
              */}
                        <AmenitiesGrid amenities={amenitiesForGrid} />

                    </div>
                </div>

                {/* Product Description Section */}
                {product.description && product.amenities && (
                    <div className="mt-4 mt-lg-5">
                        <ProductDescription
                            initialText={product.description}
                            fullText={product.description}
                            keyFeatures={product.amenities}
                        />
                    </div>
                )}

                <div className="mt-4 mt-lg-5">
                    <SimilarListings properties={similarListings.properties} />
                </div>
            </main>
        </>
    );
}