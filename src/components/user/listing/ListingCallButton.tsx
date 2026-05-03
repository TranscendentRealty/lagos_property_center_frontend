'use client';

import { FaPhoneAlt } from 'react-icons/fa';

interface ListingCallButtonProps {
  href: string;
}

export default function ListingCallButton({ href }: ListingCallButtonProps) {
  const handleClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18071781411/vu3sCL_Ttp4cEKOApqlD',
        value: 35.0,
        currency: 'USD',
      });
    }
  };

  return (
    <a
      href={href}
      className="btn book-call-btn btn-lg"
      aria-label="Call us"
      onClick={handleClick}
    >
      <FaPhoneAlt size={18} className="text-white" />
    </a>
  );
}
