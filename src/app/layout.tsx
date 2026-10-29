import type { Metadata, Viewport } from "next"; // <-- Added Viewport import
import { Inter } from "next/font/google";
import JourneyMeasurement from "@/components/user/layout/JourneyMeasurement";
import { CookiePreferencesButton } from "@/components/user/layout/CookieConsentModal";
import "../assets/scss/main.scss";
import "../assets/scss/library/style.scss";
import "./globals.css";
import "react-image-gallery/styles/css/image-gallery.css";
import CookieConsentModal from "@/components/user/layout/CookieConsentModal";
import FloatingContactButtons from "@/components/user/layout/FloatingWhatsAppButton";

import AOSAnimation from "@/utils/AosInit";
import Header from "@/components/user/layout/Header";
import Footer from "@/components/user/layout/Footer";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const callNumber = process.env.NEXT_PUBLIC_CALL_NUMBER;

const inter = Inter({ subsets: ["latin"] });

// --- FIX 2: Correct Next.js Viewport Export ---
// This replaces the manual <meta name="viewport"> tag and fixes mobile zooming for SEO.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allows zooming for accessibility (Lighthouse loves this)
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://transcendentrealty.com"),
  referrer: "no-referrer",
  title: {
    default: "Transcendent Realty | Premium Real Estate in Lagos, Nigeria",
    template: "%s | Transcendent Realty",
  },
  description: "Buy or invest in premium Lagos properties with Transcendent Realty. Experience a seamless property search powered by innovative AI technology.",
  keywords:[
    "real estate Lagos",
    "buy property in Lagos",
    "property investment Nigeria",
    "AI property search Lagos",
    "Transcendent Realty",
    "luxury homes Lagos"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Transcendent Realty | Buy & Invest in Lagos Properties",
    description: "Discover curated, high-quality real estate listings in Lagos. Use our AI-powered search to find your dream home or next great investment.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Transcendent Realty",
    images:[
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Luxury Real Estate in Lagos by Transcendent Realty",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Transcendent Realty | Premium Real Estate in Lagos",
    description: "Find your dream home or investment property in Lagos with our seamless, AI-powered real estate platform.",
    images:["/images/opengraph-image.png"],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Transcendent Realty Services",
    "image": "https://media.transcendentrealty.com/logo.png",
    "description": "A premier real estate company based in Lagos, Nigeria, focused on simplifying how people buy and invest in property.",
    "url": "https://transcendentrealty.com",
    "telephone": "+2349169112315",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lagos",
      "addressRegion": "LA",
      "addressCountry": "NG"
    },
    "areaServed": "Lagos",
    "priceRange": "$$$"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />

        <JourneyMeasurement />
        <Header />

        <AOSAnimation>
          {children}
        </AOSAnimation>

        {/* --- FIX 1: Moved fixed/absolute components OUTSIDE the animation wrapper --- */}
        <CookieConsentModal />
        {(whatsappNumber || callNumber) && (
          <FloatingContactButtons
            phoneNumber={whatsappNumber}
            callNumber={callNumber}
            fixedLabel="Speak with Bukunmi now."
          />
        )}

        <Footer />

      </body>
    </html>
  );
}
