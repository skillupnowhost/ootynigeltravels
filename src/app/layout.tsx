import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { site } from "@/lib/config/site";
import { averageRating } from "@/lib/db/queries/reviews";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Best Travel Agency in Ooty & Coimbatore`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Ooty Nigel Travels",
    "best travels in Ooty",
    "best travel agency in Ooty and Coimbatore",
    "Ooty Coimbatore taxi service",
    "Coimbatore to Ooty cab booking",
    "Coimbatore airport to Ooty taxi",
    "Ooty tour packages",
    "Nilgiris tour packages",
    "Ooty taxi service",
    "luxury travel Ooty",
    "Coonoor Kotagiri tours",
    "Ooty sightseeing package",
    "Nilgiris tour operator",
    "Mudumalai Gudalur taxi",
    "Ooty best travel",
    "best travels in Ooty for family trip",
    "Ooty travel agency near me",
    "best tour operator in Ooty",
    "Ooty honeymoon packages",
    "Ooty local sightseeing taxi",
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: site.url },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Best Travel Agency in Ooty & Coimbatore`,
    description: site.description,
    images: [
      {
        url: "/images/brand/logo-full.png",
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Best Travel Agency in Ooty & Coimbatore`,
    description: site.description,
    images: ["/images/brand/logo-full.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b3b2e",
  width: "device-width",
  initialScale: 1,
};

async function getOrganizationJsonLd() {
  const rating = await averageRating().catch(() => null);

  return {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    "@id": `${site.url}/#business`,
    name: site.name,
    alternateName: "Ooty Coimbatore Travels",
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    image: `${site.url}/images/brand/logo-full.png`,
    logo: `${site.url}/images/brand/logo-full.png`,
    telephone: site.phone,
    email: site.email,
    priceRange: "₹₹",
    hasMap: `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Tamil"],
      },
      {
        "@type": "ContactPoint",
        telephone: site.altPhone,
        contactType: "reservations",
        areaServed: "IN",
        availableLanguage: ["English", "Tamil"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.addressLine1,
      addressLocality: "Ooty (Udhagamandalam)",
      addressRegion: "Tamil Nadu",
      postalCode: "643001",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    areaServed: site.areaServed.map((area) => ({ "@type": "City", name: area })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average.toFixed(1),
            reviewCount: rating.count,
          },
        }
      : {}),
    sameAs: [site.social.instagram, site.social.facebook, site.social.youtube, site.social.telegram],
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = await getOrganizationJsonLd();
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    alternateName: ["Ooty Nigel Travels", "Nigel Travels Ooty"],
    url: site.url,
    inLanguage: "en-IN",
    publisher: { "@id": `${site.url}/#business` },
  };

  return (
    <html lang="en-IN" className={`${fraunces.variable} ${manrope.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
