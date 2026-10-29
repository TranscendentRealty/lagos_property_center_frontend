import { IProperty } from '@/types/property';
export function listingMetadata(property: IProperty, base: string) {
  const url = new URL(`/listing/${property._id}`, base).href;
  const availability = property.status === 'Available' ? 'https://schema.org/InStock'
    : property.status === 'Sold' ? 'https://schema.org/SoldOut' : undefined;
  return {
    '@context': 'https://schema.org', '@type': 'RealEstateListing', '@id': url, url,
    name: property.title, description: property.description, image: property.photos,
    dateModified: property.updatedAt,
    offers: { '@type': 'Offer', url, price: property.price, priceCurrency: 'NGN', availability,
      businessFunction: property.listingType === 'For Rent' ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell' },
  };
}
