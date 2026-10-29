'use client';
import { FaPhoneAlt } from 'react-icons/fa';
import { trackContact } from '@/lib/measurement';
export default function ListingCallButton({ href, propertyId }: { href: string; propertyId?: string }) {
  return <a href={href} className="btn btn-dark d-inline-flex align-items-center gap-2"
    onClick={() => trackContact('call', 'listing', propertyId)}><FaPhoneAlt aria-hidden="true" />Call the agent</a>;
}
