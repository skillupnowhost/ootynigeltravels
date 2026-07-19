// Central business identity — every placeholder value below is fictional
// and safe to overwrite with your real business details before launch.
export const site = {
  name: "Ooty Nigel Travels",
  tagline: "Ooty, Curated in Luxury",
  description:
    "Ooty Nigel Travels is the best-rated travel agency for Ooty, Coimbatore and the surrounding Nilgiris — signature holiday packages, Coimbatore Airport pickups and private chauffeur-driven tours across Ooty, Coonoor, Kotagiri and Mudumalai.",
  phone: "+91 83006 04739",
  phoneHref: "tel:+918300604739",
  altPhone: "+91 8072 728 891",
  altPhoneHref: "tel:+918072728891",
  emergencyPhone: "+91 8072 728 891",
  emergencyPhoneHref: "tel:+918072728891",
  bookingSupportPhone: "+91 8072 728 891",
  bookingSupportPhoneHref: "tel:+918072728891",
  whatsapp: "918300604739",
  email: "ootynigeltravels43@gmail.com",
  bookingEmail: "ootynigeltravels43@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ootynigeltravels.com",
  address: "65 Bombay Castle, Near JSS College, Elk Hill Road, Ooty (Udhagamandalam), The Nilgiris, Tamil Nadu 643001, India",
  addressLine1: "65 Bombay Castle, Near JSS College, Elk Hill Road",
  addressLine2: "Ooty (Udhagamandalam), The Nilgiris, Tamil Nadu 643001",
  geo: { lat: 11.402124, lng: 76.708078 },
  hours: "Open 24 × 7 — every day of the year",
  areaServed: [
    "Ooty",
    "Udhagamandalam",
    "Coimbatore",
    "Coonoor",
    "Kotagiri",
    "Mudumalai",
    "Gudalur",
    "The Nilgiris",
  ],
  social: {
    instagram: "https://www.instagram.com/ootynigeltravels43",
    facebook: "https://facebook.com/ootynigeltravels",
    youtube: "https://youtube.com/@ootynigeltravels",
    telegram: "https://t.me/ootynigeltravels",
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
