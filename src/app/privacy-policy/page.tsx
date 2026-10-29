import { CookiePreferencesButton } from '@/components/user/layout/CookieConsentModal';
export const metadata = { title: 'Privacy and cookie choices', alternates: { canonical: '/privacy-policy' } };
export default function PrivacyPolicy() {
  return <main className="container py-5" style={{ maxWidth: 850 }}>
    <h1>Privacy and cookie choices</h1><p>Updated 28 October 2026 · Transcendent Realty</p>
    <h2 className="h4 mt-4">Browsing and contacting us</h2>
    <p>You can browse properties, call us or open WhatsApp without accepting optional measurement. When you contact us, we use the information you choose to share to respond and help with your property search. A contact-button click does not tell us whether you sent a message or completed a call.</p>
    <h2 className="h4 mt-4">Your choices</h2>
    <p>Website analytics and advertising measurement are separate, optional choices. Both start off for every visitor. Your choice is stored in this browser for up to 180 days before we ask again. You can change or withdraw it here or through the footer.</p>
    <CookiePreferencesButton />
    <p className="mt-3">Withdrawing stops our optional tracking on subsequent use and reloads the page to unload tags. We also remove accessible first-party Google measurement cookies for the categories you decline. This does not delete data already received by a provider or cookies held on another domain.</p>
    <h2 className="h4 mt-4">Optional measurement</h2>
    <p>When analytics is configured and you accept it, Google Analytics helps measure page visits, visible-page engagement time, search use, result counts, errors and contact attempts. These records may include a pseudonymous browser identifier and event times; they are not a way for us to discover your email address. Our events exclude raw search descriptions, phone numbers and email addresses, and strip query strings from page URLs.</p>
    <p>When you accept advertising measurement, Google Ads measures contact attempts against our advertising. We do not enable advertising personalization through these controls. Google tags are not loaded by this website until an applicable optional category is accepted.</p>
    <p>Google processes information under its own policies. Read <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">how Google uses data from partner sites</a>. Measurement retention depends on the configured provider account; we do not promise an unverified retention period.</p>
    <h2 className="h4 mt-4">Search requests and technical records</h2>
    <p>Property searches are processed to provide the service you request. AI-assisted descriptions are sent to our search provider, DeepSeek, to identify property criteria. Please avoid putting personal or sensitive information in search descriptions. A short-lived server cache of parsed criteria reduces repeated requests and expires after 15 minutes. We do not extract personal details from other websites’ cookies or run session replay.</p>
    <p>Our hosting and service providers may process connection information and operational logs to deliver and protect the site. Our application access logs omit search query strings. Contact messages and search-service requests are separate from optional analytics.</p>
    <h2 className="h4 mt-4">Other services and requests</h2>
    <p>WhatsApp, embedded media and external links have their own privacy practices. Information you send through those services is governed by their policies as well.</p>
    <p>For questions about information you have shared with us, or to request access, correction or deletion, email <a href="mailto:info@transcendentrealty.com">info@transcendentrealty.com</a>.</p>
  </main>;
}
