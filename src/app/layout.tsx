import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // 1. Base URL (Crucial for Next.js to accurately resolve relative image paths for SEO)
  metadataBase: new URL('https://www.transcendentrealty.com'),

  // 2. Optimized Title (Targets Location + Intent)
  title: {
    default: "Transcendent Realty | Premium Real Estate in Lagos, Nigeria",
    template: "%s | Transcendent Realty", // E.g., "Buy Properties | Transcendent Realty"
  },

  // 3. Precision Description (hits AI, Lagos, buy/invest, and stays under Google's 160-char limit)
  description: "Buy or invest in premium Lagos properties with Transcendent Realty. Experience a seamless property search powered by innovative AI technology.",

  // 4. High-Intent Keywords (What clients are actually typing into Google)
  keywords: [
    "real estate Lagos",
    "buy property in Lagos",
    "property investment Nigeria",
    "AI property search Lagos",
    "Transcendent Realty",
    "luxury homes Lagos",
    "real estate company in Nigeria",
    "Lagos curated property listings",
    "houses for sale in Lagos",
    "property for sale in Lagos",
    "investing in Lagos real estate",
    "nigerian property center",
    "property pro"
  ],

  // 5. Advanced Crawling Instructions
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

  // 6. Open Graph (For pristine link previews on WhatsApp, LinkedIn, etc. - MASSIVE for Real Estate)
  openGraph: {
    title: "Transcendent Realty | Buy & Invest in Lagos Properties",
    description: "Discover curated, high-quality real estate listings in Lagos. Use our AI-powered search to find your dream home or next great investment.",
    url: "https://www.transcendentrealty.com",
    siteName: "Transcendent Realty",
    images: [
      {
        // export a stunning, high-res photo of a luxury Lagos property and put it in your public folder!
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Luxury Real Estate in Lagos by Transcendent Realty",
      },
    ],
    locale: "en_NG", // Tells search engines this is hyper-targeted to English speakers in Nigeria
    type: "website",
  },

  // 7. Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "Transcendent Realty | Premium Real Estate in Lagos",
    description: "Find your dream home or investment property in Lagos with our seamless, AI-powered real estate platform.",
    images: ["/images/opengraph-image.png"],
  },

  // 8. Canonical URL (Prevents duplicate content penalties)
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Real Estate Agent Schema Markup
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Transcendent Realty Services",
    "image": "https://media.transcendentrealty.com/logo.png", // Ensure you have this logo in your public folder
    "description": "A premier real estate company based in Lagos, Nigeria, focused on simplifying how people buy and invest in property.",
    "url": "https://transcendentrealty.com",
    "telephone": "+2349169112315", // Add the official contact number here
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lagos",
      "addressRegion": "LA",
      "addressCountry": "NG"
    },
    "areaServed": "Lagos",
    "priceRange": "$$$" // Indicates premium listings
  };


  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1 maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
        <Header />
        <AOSAnimation>
          {children}
          {/* <CookieConsentModal /> */}
          {whatsappNumber && callNumber && (
            <FloatingContactButtons
              phoneNumber={whatsappNumber}
              callNumber={callNumber}
              fixedLabel="Talk to Bukunmi now." // Customize the label text here
            />
          )}
        </AOSAnimation>

        <Footer />

      </body>
    </html>
  );
}
