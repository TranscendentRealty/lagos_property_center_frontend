'use client';
import { FaWhatsapp } from 'react-icons/fa';
import { trackContact } from '@/lib/measurement';
export default function ListingWhatsAppButton({ href, propertyId, label = 'Discuss a viewing' }: { href: string; propertyId?: string; label?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-success d-inline-flex align-items-center gap-2"
    onClick={() => trackContact('whatsapp', 'listing', propertyId)}><FaWhatsapp aria-hidden="true" />{label}</a>;
}
