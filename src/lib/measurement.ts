export type Consent = { analytics: boolean; ads: boolean };
export const CONSENT_KEY = 'tr-consent-v1';
export const CONSENT_EVENT = 'tr-consent-change';
export const ADS_ID = 'AW-18071781411';
// Enable only after disabling automatic enhanced-measurement events in the GA stream.
export const GA_ID = process.env.NEXT_PUBLIC_GA_MANUAL_EVENTS_VERIFIED === 'true' && /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '') ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID! : '';
const denied: Consent = { analytics: false, ads: false };
let initialized = false;
let visitConsent: Consent | undefined;

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  if (visitConsent) return visitConsent;
  try {
    const stored = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (!stored || typeof stored.analytics !== 'boolean' || typeof stored.ads !== 'boolean' ||
      typeof stored.savedAt !== 'number' || Date.now() - stored.savedAt > 180 * 86400000) return null;
    return { analytics: stored.analytics, ads: stored.ads };
  } catch { return null; }
}
export function consentValues(consent: Consent) {
  return { analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.ads ? 'granted' : 'denied', ad_user_data: consent.ads ? 'granted' : 'denied',
    ad_personalization: 'denied' }; // Remarketing/personalization is outside this repair.
}
export function safePath(path: string): string {
  if (/^\/listing\/[a-f\d]{24}\/?$/i.test(path)) return path.replace(/\/$/, '');
  if (/^\/(search|search-with-ai|explore|contact-us|about-us|privacy-policy)\/?$/.test(path) || path === '/') return path;
  if (path.startsWith('/explore/')) return '/explore';
  if (path.startsWith('/agent/')) return '/agent';
  return '/other';
}
export function pageContext(pathname = window.location.pathname) {
  const path = safePath(pathname);
  return { page_location: window.location.origin + path, page_referrer: '', page_title: path === '/' ? 'Home' : path.split('/')[1] };
}
export function initializeMeasurement() {
  const consent = readConsent() || denied;
  if (initialized || (!consent.ads && !(consent.analytics && GA_ID))) return;
  initialized = true;
  window.dataLayer = [];
  // eslint-disable-next-line prefer-rest-params -- Google's command queue uses an Arguments object.
  window.gtag = function (..._args: Parameters<Window['gtag']>) { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', consentValues(denied));
  window.gtag('consent', 'update', consentValues(consent));
  window.gtag('set', { ...pageContext(), ads_data_redaction: true, allow_google_signals: false, allow_ad_personalization_signals: false });
  window.gtag('js', new Date());
  const settings = { ...pageContext(), send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false };
  if (consent.ads) window.gtag('config', ADS_ID, settings);
  if (consent.analytics && GA_ID) window.gtag('config', GA_ID, settings);
  const script = document.createElement('script');
  script.id = 'consented-google-tag'; script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${consent.ads ? ADS_ID : GA_ID}`;
  document.head.appendChild(script);
}
export function saveConsent(consent: Consent) {
  visitConsent = consent;
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...consent, savedAt: Date.now() })); } catch {
    try { localStorage.removeItem(CONSENT_KEY); } catch { /* In-memory choice still applies this visit. */ }
  }
  if (initialized) window.gtag?.('consent', 'update', consentValues(consent));
  if (!consent.analytics || !consent.ads) {
    // Remove accessible first-party Google cookies on withdrawal; third-party cookies are not accessible.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if ((!consent.analytics && /^_ga|^_gid|^_gat/.test(name)) || (!consent.ads && /^_gcl_/.test(name))) {
        const parts = location.hostname.split('.');
        const domains = ['', ...parts.map((_, i) => '.' + parts.slice(i).join('.'))];
        for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''}`;
      }
    }
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
  // A fresh document unloads previously authorized tags and prevents stale queued events.
  if (initialized) window.location.reload();
  else initializeMeasurement();
}
const eventNames = new Set(['page_view', 'page_engagement', 'ai_section_view', 'search_submit', 'search_results', 'search_error', 'contact_intent']);
const parameterNames = new Set(['search_mode', 'result_count', 'page_number', 'channel', 'placement', 'property_id', 'engagement_time_msec']);
export function trackEvent(name: string, params: Record<string, string | number> = {}, pathname?: string) {
  if (!eventNames.has(name) || !readConsent()?.analytics || !GA_ID) return;
  initializeMeasurement();
  const safe = Object.fromEntries(Object.entries(params).filter(([key, value]) => parameterNames.has(key) &&
    (typeof value === 'number' ? Number.isFinite(value) : /^[a-z\d_-]{1,50}$/i.test(value))));
  window.gtag?.('event', name, { ...safe, ...pageContext(pathname), send_to: GA_ID, event_time: new Date().toISOString() });
}
export function trackContact(channel: 'whatsapp' | 'call', placement: 'listing' | 'floating' | 'empty' | 'footer' | 'agent' | 'contact_page', propertyId?: string) {
  trackEvent('contact_intent', { channel, placement, ...(propertyId ? { property_id: propertyId } : {}) });
  if (!readConsent()?.ads) return;
  initializeMeasurement();
  const labels = { listing: { whatsapp: '2Y-WCIWKtp4cEKOApqlD', call: 'vu3sCL_Ttp4cEKOApqlD' },
    floating: { whatsapp: 'fMnfCIjkmZwcEKOApqlD', call: 'jTWDCN-VyZ4cEKOApqlD' } };
  window.gtag?.('event', 'conversion', { ...pageContext(), send_to: `${ADS_ID}/${labels[placement === 'listing' ? 'listing' : 'floating'][channel]}`,
    value: 35, currency: 'USD' }); // Preserve legacy value pending account audit; not verified revenue.
}
