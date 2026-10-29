'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { CONSENT_EVENT, CONSENT_KEY, initializeMeasurement, readConsent, trackEvent } from '@/lib/measurement';
export default function JourneyMeasurement() {
  const pathname = usePathname();
  const lastView = useRef<string | null>(null);
  useEffect(() => {
    let started = 0;
    function flush() {
      if (!started) return;
      const duration = Date.now() - started; started = 0;
      if (duration > 100) trackEvent('page_engagement', { engagement_time_msec: duration }, pathname);
    }
    function begin() {
      initializeMeasurement();
      if (!readConsent()?.analytics) { started = 0; return; }
      if (lastView.current !== pathname) { trackEvent('page_view', {}, pathname); lastView.current = pathname; }
      if (document.visibilityState === 'visible' && !started) started = Date.now();
    }
    function visibility() { if (document.visibilityState === 'hidden') flush(); else begin(); }
    function changedElsewhere(event: StorageEvent) { if (event.key === CONSENT_KEY || event.key === null) window.location.reload(); }
    begin();
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', flush);
    window.addEventListener(CONSENT_EVENT, begin);
    window.addEventListener('storage', changedElsewhere);
    return () => { flush(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', flush); window.removeEventListener(CONSENT_EVENT, begin); window.removeEventListener('storage', changedElsewhere); };
  }, [pathname]);
  return null;
}
