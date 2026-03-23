import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.transcendentrealty.com';

// Static pages with hand-tuned priority and change frequency.
// Priority is relative (0–1) and signals importance to crawlers, not ranking.
// changeFrequency is a hint; Google may crawl at its own cadence regardless.
const staticPages: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0, // highest — primary entry point
  },
  {
    url: `${BASE_URL}/explore`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9, // near-highest — main discovery/browse surface
  },
  {
    url: `${BASE_URL}/search-with-ai`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7, // stable feature page; can rank for "AI property search Lagos" queries
  },
  {
    url: `${BASE_URL}/about-us`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5, // brand page — important for E-E-A-T but low search volume
  },
  {
    url: `${BASE_URL}/contact-us`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.4, // conversion page; rarely changes, low organic search traffic
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiBaseUrl}/api/v1/properties/all?page=1&limit=500`, {
      // Same cache strategy as generateStaticParams — built once, reused across the build.
      cache: 'force-cache',
    });

    if (!res.ok) {
      console.error(`sitemap: API returned ${res.status} — falling back to static pages only`);
      return staticPages;
    }

    const data = await res.json();
    const properties: { _id: string; updatedAt?: string }[] =
      data?.data?.properties ?? [];

    const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
      url: `${BASE_URL}/listing/${property._id}`,
      // Use the listing's own updatedAt so Google knows when the content last changed
      // (price update, new photos, status change, etc.).
      lastModified: property.updatedAt ? new Date(property.updatedAt) : new Date(),
      changeFrequency: 'weekly', // listings can change price or status at any time
      priority: 0.8, // core content pages — second only to the main browsing surfaces
    }));

    return [...staticPages, ...propertyPages];
  } catch (error) {
    console.error('sitemap: failed to fetch property list — falling back to static pages only', error);
    return staticPages;
  }
}
