'use client';
import { useEffect, useState } from 'react';
import { readConsent, saveConsent } from '@/lib/measurement';
export function CookiePreferencesButton() {
  return <button type="button" className="btn btn-link text-reset p-0" onClick={() => window.dispatchEvent(new Event('tr-open-consent'))}>Cookie preferences</button>;
}
export default function CookieConsentModal() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);
  useEffect(() => {
    function show() { const stored = readConsent(); setAnalytics(stored?.analytics || false); setAds(stored?.ads || false); setOpen(true); }
    if (!readConsent()) show();
    window.addEventListener('tr-open-consent', show);
    return () => window.removeEventListener('tr-open-consent', show);
  }, []);
  function choose(next: { analytics: boolean; ads: boolean }) { setOpen(false); saveConsent(next); }
  if (!open) return null;
  return <section className="consent-panel border rounded shadow bg-white p-3" aria-label="Cookie preferences">
    <h2 className="h5">Your privacy choices</h2>
    <p className="small">Optional measurement helps us improve property searches and understand advertising. You can browse, call and use WhatsApp without accepting it. <a href="/privacy-policy">Privacy policy</a></p>
    <div className="d-flex flex-wrap gap-3 mb-3">
      <label><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Website analytics</label>
      <label><input type="checkbox" checked={ads} onChange={e => setAds(e.target.checked)} /> Advertising measurement</label>
    </div>
    <div className="d-flex flex-wrap gap-2">
      <button className="btn btn-outline-dark" onClick={() => choose({ analytics: false, ads: false })}>Decline optional</button>
      <button className="btn btn-outline-dark" onClick={() => choose({ analytics, ads })}>Save choices</button>
      <button className="btn btn-dark" onClick={() => choose({ analytics: true, ads: true })}>Accept optional</button>
    </div>
  </section>;
}
