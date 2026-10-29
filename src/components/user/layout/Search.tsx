'use client';
import { FormEvent, useId, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/measurement';
interface SearchProps {
  classNames?: string; headerSearch?: boolean; darkButton?: boolean; aiSearch?: boolean;
  initialValue?: string; onSearch?: (value: string) => void; pending?: boolean;
}
export default function Search({ aiSearch = false, classNames = '', initialValue = '', onSearch, pending = false }: SearchProps) {
  const [value, setValue] = useState(initialValue);
  const [navigating, startTransition] = useTransition();
  const router = useRouter();
  const id = useId();
  const busy = pending || navigating;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim() || busy) return;
    trackEvent('search_submit', { search_mode: aiSearch ? 'ai' : 'standard' });
    if (onSearch) onSearch(value.trim());
    else startTransition(() => router.push(`${aiSearch ? '/search-with-ai' : '/search'}?search=${encodeURIComponent(value.trim())}`));
  }
  return <form onSubmit={submit} className={`property-search-form ${classNames}`} aria-busy={busy}>
    <label htmlFor={id} className="form-label">{aiSearch ? 'What would you like in your home?' : 'Search properties or locations'}</label>
    <div className="d-flex flex-wrap gap-2">
      <input id={id} className="form-control" style={{ flex: '1 1 220px', minWidth: 0 }} name="search" maxLength={500} required
        value={value} onChange={event => setValue(event.target.value)} placeholder={aiSearch ? 'A 4-bedroom house in Ikate with a pool' : 'Location or property keywords'} />
      <button type="submit" className="btn btn-dark" disabled={busy}>{busy ? 'Finding homes…' : aiSearch ? 'Find matching homes' : 'Search'}</button>
    </div>
    {busy && <p role="status" className="small mt-2">Checking available properties…</p>}
  </form>;
}
