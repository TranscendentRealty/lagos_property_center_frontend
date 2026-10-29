'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { CONSENT_EVENT, readConsent, trackEvent } from '@/lib/measurement';
export default function MeasuredSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const sent = useRef(false);
  useEffect(() => {
    let visible = false;
    const report = () => { if (visible && !sent.current && readConsent()?.analytics) { trackEvent('ai_section_view'); sent.current = true; } };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; report(); }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    window.addEventListener(CONSENT_EVENT, report);
    return () => { observer.disconnect(); window.removeEventListener(CONSENT_EVENT, report); };
  }, []);
  return <section ref={ref} className="compact-ai-section my-5" aria-labelledby="ai-search-heading">{children}</section>;
}
