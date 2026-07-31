import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { site } from "@/lib/config/site";
import { averageRating } from "@/lib/db/queries/reviews";
import { serializeJsonLd } from "@/lib/seo/jsonLd";

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
    default: `${site.name} | Best Ooty Taxi, Tours & Packages`,
    template: `%s | ${site.name}`,
  },
  description:
    "Book the best Ooty taxi service, Coimbatore to Ooty cab, airport transfer, local sightseeing taxi, Ooty tour packages and Nilgiris holiday packages with Ooty Nigel Travels.",
  keywords: [
    "Ooty Nigel Travels",
    "best taxi service in Ooty",
    "best travel agency in Ooty",
    "travel agency in Ooty",
    "best travel agency in Coimbatore",
    "travel agency in Coimbatore",
    "Coimbatore travel agency",
    "Ooty taxi service",
    "Ooty cab service",
    "Coimbatore to Ooty cab",
    "Coimbatore airport to Ooty taxi",
    "Coimbatore to Ooty taxi",
    "Coimbatore to Ooty travel",
    "Coimbatore to Ooty package",
    "Coimbatore to Ooty trip",
    "Ooty airport transfer",
    "Ooty airport pickup",
    "Ooty local sightseeing taxi",
    "Ooty sightseeing package",
    "Ooty tour packages",
    "Ooty honeymoon packages",
    "Ooty family package",
    "Ooty weekend trip",
    "Ooty one day trip",
    "Ooty travel",
    "Ooty holiday travel",
    "Ooty trip",
    "travel to Ooty",
    "travels to Ooty",
    "Ooty holiday packages",
    "Nilgiris tour packages",
    "Coonoor Kotagiri tour",
    "Mudumalai taxi",
    "Gudalur taxi",
    "Avalanche tour Ooty",
    "Pykara boat house Ooty",
    "private chauffeur Ooty",
    "Ooty travel agency near me",
    "best tour operator in Ooty",
    "Coimbatore to Ooty travel",
    "Nilgiris travel agency",
    "Ooty holiday packages",
    "Ooty local trip taxi",
  ],
  authors: [{ name: site.name }],
  applicationName: site.name,
  category: "Travel",
  classification: "Travel and tourism",
  alternates: { canonical: site.url },
  other: {
    "geo.region": "IN-TN",
    "geo.placename": "Ooty, Udhagamandalam, Tamil Nadu",
    "geo.position": "11.402124;76.708078",
    ICBM: "11.402124, 76.708078",
  },
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
    title: `${site.name} | Best Ooty Taxi, Tours & Packages`,
    description:
      "Private chauffeur-driven Ooty taxi service, Coimbatore airport transfers, Ooty sightseeing and Nilgiris holiday packages.",
    images: [
      {
        url: "/images/brand/logo-full.png",
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Best Ooty Taxi, Tours & Packages`,
    description:
      "Private chauffeur-driven Ooty taxi service, Coimbatore airport transfers, Ooty sightseeing and Nilgiris holiday packages.",
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
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
