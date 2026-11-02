'use client';
import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/measurement';
import type { EntryPoint } from '@/types/assistedContact';
import { useAssistedContact } from './AssistedContactProvider';

const TITLE = 'Want help narrowing this down?';
const BODY = 'Tell us the area and type of home you have in mind. Bukunmi can suggest a short list of suitable properties and explain the next steps.';

// Proactive: a compact, nonmodal panel. It never takes focus or blocks reading.
// Inline: rendered in place for a verified zero-result search; counted as viewed only when on screen.
export default function AssistedContactOffer(props:
  | { variant: 'proactive'; onAccept: () => void; onDismiss: (reason: 'close' | 'keep_browsing') => void }
  | { variant: 'inline'; entryPoint: EntryPoint; searchMode?: 'standard' | 'ai' }) {
  const assist = useAssistedContact();
  const ref = useRef<HTMLElement>(null);
  const inline = props.variant === 'inline';
  const registerInlineOffer = assist?.registerInlineOffer;

  useEffect(() => {
    if (!inline || !registerInlineOffer) return;
    const unregister = registerInlineOffer();
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return unregister;
    let seen = false;
    const observer = new IntersectionObserver(entries => {
      if (!seen && entries.some(entry => entry.isIntersecting)) {
        seen = true;
        trackEvent('assistance_offer_view', { trigger: 'zero_results', entry_point: 'search_empty' });
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => { observer.disconnect(); unregister(); };
  }, [inline, registerInlineOffer]);

  if (!assist) return null;

  if (props.variant === 'inline') {
    return <section ref={ref} className="assist-offer assist-offer--inline" aria-labelledby="assist-inline-title">
      <h2 id="assist-inline-title" className="h5 mb-2">{TITLE}</h2>
      <p className="mb-3">{BODY}</p>
      <button type="button" className="btn btn-dark" onClick={() => assist.open({ entryPoint: props.entryPoint, trigger: 'zero_results' })}>
        Get a shortlist
      </button>
    </section>;
  }

  return <aside ref={ref} className="assist-offer assist-offer--proactive" aria-label="Shortlist offer" aria-live="polite">
    <button type="button" className="btn-close assist-offer__close" aria-label="Close shortlist offer" onClick={() => props.onDismiss('close')} />
    <h2 className="h6 mb-1 pe-4">{TITLE}</h2>
    <p className="small mb-2">{BODY}</p>
    <div className="d-flex flex-wrap gap-2">
      <button type="button" className="btn btn-dark btn-sm" onClick={props.onAccept}>Get a shortlist</button>
      <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => props.onDismiss('keep_browsing')}>Keep browsing</button>
    </div>
  </aside>;
}
