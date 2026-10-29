'use client';
import { ReactNode } from 'react';
import { trackContact } from '@/lib/measurement';
export default function ContactLink({ href, channel, placement, className, children }: {
  href: string; channel: 'whatsapp' | 'call'; placement: 'footer' | 'agent' | 'contact_page'; className?: string; children: ReactNode;
}) {
  return <a href={href} className={className} target={channel === 'whatsapp' ? '_blank' : undefined} rel="noopener noreferrer"
    onClick={() => trackContact(channel, placement)}>{children}</a>;
}
