import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Properties',
  description: 'Browse premium Lagos properties by location, type, and amenities. Find homes for sale across Lekki, Ikoyi, Victoria Island, and more.',
  openGraph: {
    title: 'Explore Properties | Transcendent Realty',
    description: 'Discover curated Lagos real estate listings across every category — from luxury duplexes to smart-home apartments.',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
