// components/layout/CookieConsentModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsentModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');

    if (consent === 'granted') {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          analytics_storage: 'granted',
        });
      }
      return;
    }

    if (consent === 'declined') {
      return;
    }

    const checkLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        if (data.in_eu || data.country === 'GB' || data.country === 'CH') {
          setShowModal(true);
          setTimeout(() => setVisible(true), 10);
        } else {
          localStorage.setItem('cookieConsent', 'granted');
        }
      } catch (error) {
        console.error('Failed to fetch location', error);
        setShowModal(true);
        setTimeout(() => setVisible(true), 10);
      }
    };

    checkLocation();
  }, []);

  const dismiss = (store?: boolean) => {
    setVisible(false);
    setTimeout(() => setShowModal(false), 300);
    if (store) localStorage.setItem('cookieConsent', 'declined');
  };

  const handleDecline = () => dismiss(true);

  const handleAcceptAll = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }
    localStorage.setItem('cookieConsent', 'granted');
    dismiss();
  };

  if (!showModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          zIndex: 1050,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1051,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Top accent bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #525536 0%, #C9A96E 50%, #525536 100%)' }} />

          <div style={{ padding: '28px 28px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f5f0e8 0%, #e6df9d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#525536"/>
                  <circle cx="8.5" cy="10.5" r="1.5" fill="#525536"/>
                  <circle cx="13.5" cy="7.5" r="1.5" fill="#525536"/>
                  <circle cx="15.5" cy="13.5" r="1.5" fill="#525536"/>
                  <circle cx="10" cy="15" r="1" fill="#525536"/>
                </svg>
              </div>
              <div>
                <h2
                  id="cookie-modal-title"
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    lineHeight: 1.2,
                  }}
                >
                  We Value Your Privacy
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  Your choice, your control
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#f0ebe3', marginBottom: '16px' }} />

            {/* Body text */}
            <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#3d3d3d', lineHeight: 1.6 }}>
              We use cookies to enhance your browsing experience, remember your saved properties, and analyze our site traffic. By clicking{' '}
              <strong style={{ color: '#1a1a1a' }}>&ldquo;Accept All&rdquo;</strong>, you consent to our use of these cookies.
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
              You can change your mind at any time. For more details, see our{' '}
              <Link
                href="/privacy-policy"
                onClick={() => dismiss()}
                style={{ color: '#525536', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 28px 24px',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              background: '#dadcd6',
              borderTop: '1px solid #f0ebe3',
            }}
          >
            <button
              onClick={handleDecline}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1.5px solid #c5bab0',
                background: 'transparent',
                color: '#555',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                lineHeight: 1,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#f0ebe3';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#525536';
                (e.currentTarget as HTMLButtonElement).style.color = '#3d3d3d';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#c5bab0';
                (e.currentTarget as HTMLButtonElement).style.color = '#555';
              }}
            >
              Decline
            </button>
            <button
              onClick={handleAcceptAll}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #525536 0%, #a08562 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 8px rgba(139,115,85,0.35)',
                lineHeight: 1,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #7a6448 0%, #525536 100%)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(139,115,85,0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #525536 0%, #a08562 100%)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(139,115,85,0.35)';
              }}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsentModal;
