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
import ListingPageSidebar from '@/components/user/listing/ListingPageSidebar';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
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
        // no-store ensures a fresh fetch at every build — avoids a stale empty cache
        // limit=500 bypasses any default server-side page size so all listings are returned
        const res = await fetch(`${apiBaseUrl}/api/v1/properties/all?page=1&limit=500`, { cache: 'no-store' });

        if (!res.ok) {
            console.error(`generateStaticParams: API error ${res.status}`);
            return [];
        }

        const data = await res.json();
        const properties: { _id: string }[] = data?.data?.properties ?? [];
        // console.log(`generateStaticParams: pre-building ${properties.length} listing pages`);
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

    return {
        title: `${product.title}`,
        description: product.description || `Details for ${product.title}, located in ${product.location.street}.`,
        openGraph: {
            title: `${product.title} | Transcendent Realty`,
            description: product.description || `Details for ${product.title}, located in ${product.location.street}.`,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${params.id}`,
            siteName: "Transcendent Realty",
            type: "article",
            publishedTime: product.updatedAt, // e.g., "2026-03-23T01:19:00Z"
            authors: ["Transcendent Realty"],
        },
        twitter: {
            card: 'summary_large_image',
        },
    };
}


// --- SERVER COMPONENT PAGE ---
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const product = await getListingDetails(id);
    const similarListings = await getSimilarListings(id);
    // console.log("Similar Listings:", similarListings);

    const schemaMarkup = {
        "@context": "https://schema.org/",
        // Pinterest treats 'Product' schemas as 'Product Rich Pins' (shows price)
        "@type": "Product",
        "name": product?.title,
        "image": product?.photos?.[0] || 'https://placehold.co/600x400/1a1a1a/ffffff.png',
        "description": product?.description,
        "brand": {
            "@type": "Brand",
            "name": "Transcendent Realty"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "NGN", // Or USD depending on your target market
            "price": product?.price, // e.g., 150000000
            "availability": "https://schema.org/InStock",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${params.id}`
        }
    };


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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />
            <ScrollToTop />

            <main className="container-fluid px-3 px-md-5 py-4 py-md-5">
                <div className="row g-3 g-lg-4">

                    {/* Filter sidebar — hidden on mobile to keep the listing readable */}
                    <div className="col-lg-3 d-none d-lg-block ps-0">
                        <ListingPageSidebar />
                    </div>

                    {/* Gallery + details take the remaining 9 columns */}
                    <div className="col-lg-9 col-md-12">
                <div className="row g-3 g-lg-4">
                    <div className="col-xl-7 col-md-12">
                        <ImageGallery galleryImages={galleryImagesForComponent} />
                    </div>

                    <div className="col-xl-5 col-md-12 product-details-column">
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
                                agentPhone={product.creator.phone}
                                rating={4.5} // This data needs to come from your API
                            />
                        )}

                        <div className="my-3">
                            <div className="btn-group w-100" role="group" aria-label="Contact options">
                                <a
                                    className="btn btn-dark btn-lg text-white book-tour-btn"
                                    aria-disabled="true"
                                    tabIndex={-1}
                                    style={{ pointerEvents: 'none', opacity: 0.9 }}
                                >
                                    Book A Tour
                                </a>
                                <a
                                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello! I'm interested in this property from your website: ${process.env.NEXT_PUBLIC_BASE_URL}/listing/${product._id}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn book-whatsapp-btn btn-lg"
                                    aria-label="Chat on WhatsApp"
                                >
                                    <FaWhatsapp size={22} className='text-white'/>
                                </a>
                                <a
                                    href={`tel:${process.env.NEXT_PUBLIC_CALL_NUMBER}`}
                                    className="btn book-call-btn btn-lg"
                                    aria-label="Call us"
                                >
                                    <FaPhoneAlt size={18} className='text-white' />
                                </a>
                            </div>
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
                    </div> {/* col-lg-9 */}
                </div> {/* outer row */}

                {/* Similar Listings — full width below the sidebar/content split */}
                <div className="mt-4 mt-lg-5">
                    <SimilarListings properties={similarListings.properties} />
                </div>
            </main>
        </>
    );
}