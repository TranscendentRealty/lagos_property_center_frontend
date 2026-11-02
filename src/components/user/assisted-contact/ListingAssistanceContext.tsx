'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toBedrooms, toPropertyTypeId } from '@/lib/assistedContact/config';
import { availableLocations } from '@/exports/constants';
import { useAssistedContact } from './AssistedContactProvider';
import AssistedContactLauncher from './AssistedContactLauncher';

// Rendered only after a listing resolved successfully. Registers its safe structured context (never its price)
// and counts one distinct view once the detail content is actually visible in a focused tab.
export default function ListingAssistanceContext({ propertyId, city, propertyType, propertySubtype, bedrooms }: {
  propertyId: string; city?: string; propertyType?: string; propertySubtype?: string; bedrooms?: number;
}) {
  const assist = useAssistedContact();
  const pathname = usePathname() || '';
  const setPageContext = assist?.setPageContext;
  const recordListingView = assist?.recordListingView;

  useEffect(() => {
    if (!setPageContext) return;
    const context = {
      source: 'listing' as const, pathname, propertyId,
      area: availableLocations.find(location => location.toLowerCase() === (city || '').trim().toLowerCase()),
      propertyType: toPropertyTypeId(propertyType, propertySubtype), bedrooms: toBedrooms(bedrooms),
    };
    setPageContext(context);
    return () => setPageContext(null);
  }, [setPageContext, pathname, propertyId, city, propertyType, propertySubtype, bedrooms]);

  useEffect(() => {
    if (!recordListingView) return;
    let done = false;
    const check = () => {
      if (done || document.visibilityState !== 'visible' || !document.hasFocus()) return;
      done = true;
      recordListingView(propertyId); // Idempotent per ID, so remounts and reloads add nothing.
    };
    check();
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => { document.removeEventListener('visibilitychange', check); window.removeEventListener('focus', check); };
  }, [recordListingView, propertyId]);

  if (!assist) return null;
  return <div className="mt-2">
    <AssistedContactLauncher entryPoint="listing" className="btn btn-link px-0 assist-similar-link">Help me find similar properties</AssistedContactLauncher>
  </div>;
}
