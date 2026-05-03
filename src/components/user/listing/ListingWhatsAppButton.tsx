'use client';

import { FaWhatsapp } from 'react-icons/fa';

interface ListingWhatsAppButtonProps {
  href: string;
}

export default function ListingWhatsAppButton({ href }: ListingWhatsAppButtonProps) {
  const handleClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18071781411/2Y-WCIWKtp4cEKOApqlD',
        value: 35.0,
        currency: 'USD',
      });
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn book-whatsapp-btn btn-lg"
      aria-label="Chat on WhatsApp"
      onClick={handleClick}
    >
      <FaWhatsapp size={22} className="text-white" />
    </a>
  );
}
