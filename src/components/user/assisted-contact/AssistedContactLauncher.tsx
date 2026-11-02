'use client';
import { MouseEvent, ReactNode } from 'react';
import type { EntryPoint } from '@/types/assistedContact';
import { useAssistedContact } from './AssistedContactProvider';

// Manual entry point. A real link to /get-a-shortlist is the fallback; with JS it opens the shared drawer.
export default function AssistedContactLauncher({ entryPoint, className, children = 'Get a shortlist' }: {
  entryPoint: EntryPoint; className?: string; children?: ReactNode;
}) {
  const assist = useAssistedContact();
  if (!assist) return null;
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; // Let "open in new tab" work.
    event.preventDefault();
    assist!.open({ entryPoint });
  }
  return <a href="/get-a-shortlist" className={className} onClick={onClick}>{children}</a>;
}
