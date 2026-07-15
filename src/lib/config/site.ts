// Central business identity — every placeholder value below is fictional
// and safe to overwrite with your real business details before launch.
export const site = {
  name: "Ooty Nigel Travels",
  tagline: "Ooty, Curated in Luxury",
  description:
    "Signature holiday packages across Ooty, Coonoor and Kotagiri — curated itineraries for families, couples and friends, with private comfort throughout.",
  phone: "+91 90000 12345",
  phoneHref: "tel:+919000012345",
  altPhone: "+91 90000 67890",
  altPhoneHref: "tel:+919000067890",
  emergencyPhone: "+91 90000 99999",
  emergencyPhoneHref: "tel:+919000099999",
  bookingSupportPhone: "+91 90000 54321",
  bookingSupportPhoneHref: "tel:+919000054321",
  whatsapp: "919000012345",
  email: "reservations@ootynigeltravels.com",
  bookingEmail: "bookings@ootynigeltravels.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  address: "Ooty (Udhagamandalam), The Nilgiris, Tamil Nadu 643001, India",
  addressLine1: "No. 14, Charing Cross Road",
  addressLine2: "Ooty (Udhagamandalam), The Nilgiris, Tamil Nadu 643001",
  geo: { lat: 11.4102, lng: 76.695 },
  hours: "Open 24 × 7 — every day of the year",
  social: {
    instagram: "https://instagram.com/ootynigeltravels",
    facebook: "https://facebook.com/ootynigeltravels",
    youtube: "https://youtube.com/@ootynigeltravels",
    telegram: "https://t.me/ootynigeltravels",
  },
  stats: {
    yearsExperience: 12,
    happyTravellers: 18500,
    toursCompleted: 6200,
    fleetSize: 24,
  },
} as const;

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** No-API-key Google Maps embed — works in an <iframe> without billing setup. */
export function mapEmbedUrl(): string {
  return `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=15&output=embed`;
}

export function mapDirectionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${site.geo.lat},${site.geo.lng}`;
}

export function mapSatelliteUrl(): string {
  return `https://www.google.com/maps/@${site.geo.lat},${site.geo.lng},350m/data=!3m1!1e3`;
}

export function mapStreetViewUrl(): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${site.geo.lat},${site.geo.lng}`;
}
