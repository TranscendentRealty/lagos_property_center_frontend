'use client';
import { useEffect, useState } from 'react';
import { Consent, CONSENT_EVENT, readConsent } from '@/lib/measurement';
export function useCookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  useEffect(() => {
    const update = () => setConsent(readConsent()); update();
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);
  return consent;
}
export default useCookieConsent;
