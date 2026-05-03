// components/layout/FloatingContactButtons.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Import both WhatsApp and Phone icons
import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';

interface FloatingContactButtonsProps {
  /**
   * Your WhatsApp number in international format.
   * e.g., '2348012345678'
   */
  phoneNumber: string;
  /**
   * Your direct call number, formatted for the `tel:` link.
   * e.g., '+2348012345678'
   */
  callNumber: string;
  /**
   * The default message that will pre-populate the WhatsApp chat.
   */
  defaultMessage?: string;
  /**
   * The fixed label text that appears below the buttons.
   */
  fixedLabel?: string;
  /**
   * How far down the user should scroll (in pixels) before the buttons appear.
   */
  showAtScrollY?: number;
}

const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({
  phoneNumber,
  callNumber,
  defaultMessage = "Hello! I'm interested in a property from your website.",
  fixedLabel = "Talk to Bukunmi now.",
  showAtScrollY = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAtScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAtScrollY]);

  if (!phoneNumber || !callNumber) {
    console.warn("FloatingContactButtons: phoneNumber or callNumber prop is missing.");
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
  const callUrl = `tel:${callNumber}`;

  const handleWhatsAppClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18071781411/fMnfCIjkmZwcEKOApqlD',
        value: 35.0,
        currency: 'USD',
      });
    }
  };

  const handleCallClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18071781411/jTWDCN-VyZ4cEKOApqlD',
        value: 35.0,
        currency: 'USD',
      });
    }
  };

  return (
    <div className={`floating-contact-container ${isVisible ? 'visible' : ''}`}>
      {/* Container for the two buttons */}
      <div className="buttons-wrapper">
        {/* Direct Call Button */}
        <Link href={callUrl} passHref legacyBehavior>
          <a
            className="floating-btn call-btn"
            aria-label="Call us"
            data-tooltip="Call Us: +2349169112315" // Use data attribute for tooltip
            onClick={handleCallClick}
          >
            <FaPhoneAlt size={24} />
          </a>
        </Link>

        {/* WhatsApp Chat Button */}
        <Link href={whatsappUrl} passHref legacyBehavior>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="floating-btn whatsapp-btn"
            aria-label="Chat with us on WhatsApp"
            data-tooltip="Chat on WhatsApp" // Use data attribute for tooltip
            onClick={handleWhatsAppClick}
          >
            <FaWhatsapp size={28} />
          </a>
        </Link>
      </div>

      {/* Fixed Label Below Buttons */}
      <div className="fixed-label">
        {fixedLabel}
      </div>
    </div>
  );
};

export default FloatingContactButtons;