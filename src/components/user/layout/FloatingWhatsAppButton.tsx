'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { contactNumber, whatsappLink } from '@/lib/contact';
import { trackContact } from '@/lib/measurement';
export default function FloatingContactButtons({ phoneNumber, callNumber, fixedLabel = 'Speak with Bukunmi', defaultMessage = 'Hello! I’d like help finding a property.', showAtScrollY = 0 }: {
  phoneNumber?: string; callNumber?: string; fixedLabel?: string; defaultMessage?: string; showAtScrollY?: number;
}) {
  const path = usePathname();
  const [context, setContext] = useState<{ id?: string; title?: string; url?: string }>({});
  const [visible, setVisible] = useState(showAtScrollY === 0);
  useEffect(() => {
    const listing = document.querySelector<HTMLElement>('[data-listing-id]');
    setContext(listing ? { id: listing.dataset.listingId, title: listing.dataset.listingTitle, url: window.location.origin + path } : {});
    const update = () => setVisible(window.scrollY >= showAtScrollY);
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [path, showAtScrollY]);
  const message = context.id ? `Hello! I'd like to discuss ${context.title}: ${context.url}. Could we speak about availability and my needs before arranging a viewing?` : defaultMessage;
  const whatsapp = whatsappLink(phoneNumber, message);
  const call = contactNumber(callNumber);
  if (!whatsapp && !call) return null;
  return <div className={`floating-contact-container ${visible ? 'visible' : ''}`}>
    <div className="buttons-wrapper">
      {call && <a href={`tel:+${call}`} className="floating-btn call-btn" aria-label={`Call the agent: +${call}`} title={`Call the agent: +${call}`}
        onClick={() => trackContact('call', 'floating', context.id)}><FaPhoneAlt size={22} aria-hidden="true" /></a>}
      {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="floating-btn whatsapp-btn" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"
        onClick={() => trackContact('whatsapp', 'floating', context.id)}><FaWhatsapp size={26} aria-hidden="true" /></a>}
    </div><div className="fixed-label">{fixedLabel}</div>
  </div>;
}
