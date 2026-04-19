// app/privacy-policy/page.tsx
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy & Cookie Policy | Transcendent Realty',
  description: 'Learn how Transcendent Realty collects, uses, and protects your personal data and how we use cookies and Google Ads tracking.',
};

export default function PrivacyPolicy() {
  return (
    <main style={{ background: '#f9f8f6', minHeight: '100vh' }}>

      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2a2b1e 0%, #525536 60%, #3d3e28 100%)',
          padding: '64px 24px 56px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(201,169,110,0.18)',
              border: '1px solid rgba(201,169,110,0.35)',
              borderRadius: '999px',
              padding: '6px 16px',
              marginBottom: '20px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#C9A96E"/>
            </svg>
            <span style={{ color: '#C9A96E', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Legal &amp; Privacy
            </span>
          </div>
          <h1
            style={{
              color: '#ffffff',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 800,
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Privacy &amp; Cookie Policy
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', margin: 0 }}>
            Last updated: April 19, 2026 &nbsp;·&nbsp; Transcendent Realty
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Quick nav card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e8e4dc',
            borderRadius: '12px',
            padding: '24px 28px',
            marginBottom: '40px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#525536', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Contents
          </p>
          <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px 24px' }}>
            {[
              'Introduction',
              'What Are Cookies?',
              'Types of Cookies We Use',
              'Google Ads &amp; Tracking',
              'Google Consent Mode',
              'Your Rights &amp; Choices',
              'Data Retention',
              'Third-Party Links',
              'Changes to This Policy',
              'Contact Us',
            ].map((item, i) => (
              <li key={i} style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ol>
        </div>

        {/* Sections */}
        {[
          {
            num: '1',
            title: 'Introduction',
            content: (
              <p>
                Welcome to <strong>Transcendent Realty</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We are committed to protecting your personal data and respecting your privacy.
                This Privacy &amp; Cookie Policy explains what information we collect when you visit <em>lagospropertycenter.com</em>, why we collect it, and how you can control it.
                By using our website, you acknowledge this policy. If you do not agree, please discontinue use of our site.
              </p>
            ),
          },
          {
            num: '2',
            title: 'What Are Cookies?',
            content: (
              <>
                <p>
                  Cookies are small text files stored on your device (computer, tablet, or phone) when you visit a website. They allow the site to remember your actions and preferences over time,
                  so you don&apos;t have to re-enter them whenever you return.
                </p>
                <p style={{ marginBottom: 0 }}>
                  We also use related technologies such as <strong>pixel tags</strong>, <strong>web beacons</strong>, and <strong>local storage</strong> that serve similar purposes to cookies.
                  All of these are referred to collectively as &ldquo;cookies&rdquo; in this policy.
                </p>
              </>
            ),
          },
          {
            num: '3',
            title: 'Types of Cookies We Use',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    label: 'Strictly Necessary',
                    color: '#2a7a4b',
                    bg: '#edf7f2',
                    border: '#b8e0cb',
                    desc: 'These cookies are essential for the website to function and cannot be disabled. They include session management, security tokens, and load-balancing cookies. No consent is required for these.',
                  },
                  {
                    label: 'Analytics & Performance',
                    color: '#1a5fa8',
                    bg: '#eef4fd',
                    border: '#bbd4f5',
                    desc: 'Set by Google Analytics, these cookies help us understand how visitors interact with our website — which pages are most visited, how long users stay, and where they come from. All data is aggregated and anonymised.',
                  },
                  {
                    label: 'Advertising & Remarketing',
                    color: '#a85b1a',
                    bg: '#fdf4ee',
                    border: '#f5d5b5',
                    desc: 'Set by Google Ads, these cookies track conversions from our ad campaigns and allow Google to show you relevant Transcendent Realty ads on other websites and Google properties after you have visited our site.',
                  },
                  {
                    label: 'Functionality & Preferences',
                    color: '#525536',
                    bg: '#f5f5ee',
                    border: '#d2d3ba',
                    desc: 'These cookies remember choices you make — such as properties you have saved or your preferred search filters — to provide a more personalised experience.',
                  },
                ].map(({ label, color, bg, border, desc }) => (
                  <div
                    key={label}
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: '10px',
                      padding: '16px 18px',
                    }}
                  >
                    <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '14px', color }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            ),
          },
          {
            num: '4',
            title: 'Google Ads & Conversion Tracking',
            content: (
              <>
                <p>
                  We use <strong>Google Ads</strong> to promote our property listings. When you interact with one of our ads and visit our website, Google places a conversion cookie on your device.
                  This allows us to measure how effective our advertising campaigns are — for example, whether an ad click resulted in a property enquiry.
                </p>
                <p>
                  Google may also use the data it collects to show you personalised advertisements for Transcendent Realty across the Google Display Network, YouTube, and Search.
                  Google processes this data as an independent data controller under its own privacy policy.
                </p>
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#4285F4',
                    color: '#ffffff',
                    padding: '11px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(66,133,244,0.35)',
                    marginTop: '4px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff"/>
                  </svg>
                  How Google Uses Data from Our Site
                </a>
              </>
            ),
          },
          {
            num: '5',
            title: 'Google Consent Mode',
            content: (
              <>
                <p>
                  We implement <strong>Google Consent Mode v2</strong> on our website. This means that before you provide your consent, all Google tracking signals
                  (<code style={{ background: '#f0ede7', padding: '1px 6px', borderRadius: '4px', fontSize: '13px', color: '#444' }}>ad_storage</code>,{' '}
                  <code style={{ background: '#f0ede7', padding: '1px 6px', borderRadius: '4px', fontSize: '13px', color: '#444' }}>analytics_storage</code>,{' '}
                  <code style={{ background: '#f0ede7', padding: '1px 6px', borderRadius: '4px', fontSize: '13px', color: '#444' }}>ad_user_data</code>, and{' '}
                  <code style={{ background: '#f0ede7', padding: '1px 6px', borderRadius: '4px', fontSize: '13px', color: '#444' }}>ad_personalization</code>)
                  are set to <strong>Denied</strong> by default for visitors in the EEA, UK, and Switzerland.
                </p>
                <p style={{ marginBottom: 0 }}>
                  Only after you explicitly click <strong>&ldquo;Accept All&rdquo;</strong> on our cookie banner are these signals updated to <strong>Granted</strong>.
                  If you click &ldquo;Decline&rdquo;, Google may still receive some non-identifying, cookieless pings for basic modelling purposes — no personal data is sent.
                </p>
              </>
            ),
          },
          {
            num: '6',
            title: 'Your Rights & Choices',
            content: (
              <>
                <p>
                  Depending on your location, you may have rights under the <strong>General Data Protection Regulation (GDPR)</strong>, the <strong>UK GDPR</strong>, or similar privacy laws,
                  including the right to access, correct, or delete personal data we hold about you.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { action: 'Withdraw cookie consent', how: 'Clear your browser cookies and reload our site — the consent banner will reappear.' },
                    { action: 'Opt out of Google personalised ads', how: 'Visit Google\'s Ad Settings at adssettings.google.com to manage or opt out of personalised advertising.' },
                    { action: 'Browser-level cookie control', how: 'Most browsers allow you to block or delete cookies entirely via Settings → Privacy & Security.' },
                    { action: 'Data access or deletion requests', how: 'Email us at info@transcendentrealty.com and we will respond within 30 days.' },
                  ].map(({ action, how }) => (
                    <div
                      key={action}
                      style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', background: '#f5f5ee', borderRadius: '8px', border: '1px solid #e0e0d0' }}
                    >
                      <svg style={{ flexShrink: 0, marginTop: '2px' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#525536" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div>
                        <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '14px', color: '#1a1a1a' }}>{action}</p>
                        <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: 1.5 }}>{how}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ),
          },
          {
            num: '7',
            title: 'Data Retention',
            content: (
              <p>
                Cookie consent preferences stored in your browser&apos;s <code style={{ background: '#f0ede7', padding: '1px 6px', borderRadius: '4px', fontSize: '13px', color: '#444' }}>localStorage</code> persist
                until you clear your browser data. Google Analytics data is retained for <strong>14 months</strong> before automatic deletion. Google Ads conversion data is typically retained for <strong>90 days</strong>.
                We do not sell or share your personal data with any third parties beyond the services explicitly described in this policy.
              </p>
            ),
          },
          {
            num: '8',
            title: 'Third-Party Links',
            content: (
              <p>
                Our website may contain links to third-party websites (such as property portals or social media platforms). These sites operate independently and have their own privacy policies.
                We have no responsibility or liability for their content or practices. We encourage you to review their policies before providing any personal information.
              </p>
            ),
          },
          {
            num: '9',
            title: 'Changes to This Policy',
            content: (
              <p>
                We may update this policy from time to time to reflect changes in law, technology, or our business practices. When we do, we will revise the &ldquo;Last updated&rdquo; date at the top of this page.
                We encourage you to review this page periodically. Continued use of our website after a policy update constitutes your acceptance of the revised terms.
              </p>
            ),
          },
          {
            num: '10',
            title: 'Contact Us',
            content: (
              <>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy &amp; Cookie Policy or our data practices, please contact us:
                </p>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f5f4ee 0%, #eeecd9 100%)',
                    border: '1px solid #d2d3ba',
                    borderRadius: '10px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#2a2b1e' }}>Transcendent Realty</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:info@transcendentrealty.com" style={{ color: '#525536', fontWeight: 600, textDecoration: 'underline' }}>
                      info@transcendentrealty.com
                    </a>
                  </p>
                  {/* <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>
                    <strong>Website:</strong>{' '}
                    <Link href="/" style={{ color: '#525536', fontWeight: 600, textDecoration: 'underline' }}>
                      www.transcendentrealty.com
                    </Link>
                  </p> */}
                </div>
              </>
            ),
          },
        ].map(({ num, title, content }) => (
          <section
            key={num}
            style={{
              background: '#ffffff',
              border: '1px solid #e8e4dc',
              borderRadius: '12px',
              padding: '28px 32px',
              marginBottom: '16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #525536 0%, #737555 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: '#C9A96E', fontSize: '13px', fontWeight: 800 }}>{num}</span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1a1a1a',
                }}
              >
                {title}
              </h2>
            </div>
            <div style={{ fontSize: '15px', color: '#2d2d2d', lineHeight: 1.75 }}>
              {content}
            </div>
          </section>
        ))}

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '32px' }}>
          This policy was written to comply with the EU GDPR, UK GDPR, and Google&apos;s{' '}
          <a
            href="https://support.google.com/google-ads/answer/10000067"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#525536', fontWeight: 600, textDecoration: 'underline' }}
          >
            EU User Consent Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
