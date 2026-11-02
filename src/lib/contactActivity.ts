// Local "the visitor has contacted us" signal. It is deliberately independent of analytics consent,
// Google's scripts and ad blockers, so a direct contact always suppresses proactive shortlist offers.
// Channels are wider than Ads' call/WhatsApp conversion labels.
export type ContactActivityChannel = 'whatsapp' | 'call' | 'email' | 'phone_copy' | 'contact_form' | 'shortlist_request';
export const CONTACT_ACTIVITY_EVENT = 'tr-contact-activity';

export function publishContactActivity(channel: ContactActivityChannel) {
  if (typeof window === 'undefined') return;
  try { window.dispatchEvent(new CustomEvent(CONTACT_ACTIVITY_EVENT, { detail: { channel } })); } catch { /* Never block contact. */ }
}

export function onContactActivity(listener: (channel: ContactActivityChannel) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<{ channel: ContactActivityChannel }>).detail.channel);
  window.addEventListener(CONTACT_ACTIVITY_EVENT, handler);
  return () => window.removeEventListener(CONTACT_ACTIVITY_EVENT, handler);
}
