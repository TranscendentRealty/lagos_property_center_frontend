'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAssistedContact } from './AssistedContactProvider';
import AssistedContactForm from './AssistedContactForm';

// The real fallback destination for every launcher. Uses the same draft as the drawer.
export default function ShortlistPageForm() {
  const assist = useAssistedContact();
  const opened = useRef(false);
  const open = assist?.open;
  useEffect(() => {
    if (!open || opened.current) return;
    opened.current = true;
    open({ entryPoint: 'page' });
  }, [open]);

  if (!assist) {
    return <p>Online shortlist requests aren’t available at the moment. Please <Link href="/contact-us">contact us</Link> and we’ll help you find a suitable property.</p>;
  }
  return <AssistedContactForm mode="page" />;
}
