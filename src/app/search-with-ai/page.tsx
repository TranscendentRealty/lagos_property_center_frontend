import SearchResultsPage from '@/components/user/search/SearchResultsPage';
import { SearchParams } from '@/lib/search';
export const dynamic = 'force-dynamic';
export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <SearchResultsPage searchParams={searchParams} ai />;
}
