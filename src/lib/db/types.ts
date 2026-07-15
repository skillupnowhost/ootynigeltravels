export type UserRole = "admin" | "manager" | "staff" | "customer";

export interface User {
  id: number;
  role: UserRole;
  name: string;
  phone: string;
  email: string | null;
  password_hash: string;
  created_at: string;
}

export interface Session {
  id: string;
  token_hash: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface Driver {
  id: number;
  slug: string;
  name: string;
  phone: string;
  license_no: string | null;
  photo: string | null;
  experience_years: number;
  languages: string[];
  rating: number;
  bio: string | null;
  active: number;
  created_at: string;
}

export type FleetModelKind = "3d" | "photo" | "icon";

export interface FleetVehicle {
  id: number;
  slug: string;
  name: string;
  category: string;
  seats: number;
  luggage: string | null;
  price_per_day: number;
  model_kind: FleetModelKind;
  hero_asset: string | null;
  gallery: string[];
  features: string[];
  active: number;
  created_at: string;
}

export interface Destination {
  id: number;
  slug: string;
  name: string;
  region: string | null;
  description: string | null;
  image: string | null;
  highlights: string[];
  best_season: string | null;
  distance_from_ooty: string | null;
  active: number;
  created_at: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface PackageFaq {
  question: string;
  answer: string;
}

export interface TourPackage {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  summary: string | null;
  description: string | null;
  duration_label: string | null;
  price_from: number;
  hero_image: string | null;
  category: string | null;
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  faqs: PackageFaq[];
  highlights: string[];
  gallery: string[];
  original_price: number | null;
  rating: number;
  review_count: number;
  vehicle_options: string[];
  max_group_size: number | null;
  duration_days: number | null;
  distance_label: string | null;
  pickup_drop: string | null;
  driver_info: string | null;
  best_time: string | null;
  places_covered: string[];
  active: number;
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  pct: number;
  active: number;
  note: string | null;
  expires_at: string | null;
  created_at: string;
}

export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Driver Assigned",
  "In Progress",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ["Unpaid", "Partial", "Paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface Booking {
  id: number;
  booking_code: string;
  customer_id: number | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  package_id: number | null;
  fleet_id: number | null;
  destination: string | null;
  travel_date: string;
  end_date: string | null;
  pickup_location: string;
  pickup_time: string | null;
  adults: number;
  children: number;
  estimate_amount: number;
  coupon_code: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  driver_id: number | null;
  vehicle_number: string | null;
  remarks: string | null;
  itinerary: ItineraryDay[];
  cancel_requested: number;
  created_at: string;
  updated_at: string;
}

export interface BookingHistoryEntry {
  id: number;
  booking_id: number;
  status: string;
  note: string | null;
  created_at: string;
}

export interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  package_id: number | null;
  source: string;
  approved: number;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: number;
  created_at: string;
}

export const BLOG_CATEGORIES = ["Guides", "Tips", "Seasonal", "Photo Spots", "Food", "Updates"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: string | null;
  read_minutes: number;
  tags: string[];
  category: BlogCategory;
  published_at: string;
}

export interface GalleryImage {
  id: number;
  category: string;
  src: string;
  alt: string;
  caption: string | null;
  credit: string | null;
  featured: number;
  sort_order: number;
  active: number;
  created_at: string;
}

export interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
}

export const TRIP_REQUEST_STATUSES = ["New", "Contacted", "Converted", "Closed"] as const;
export type TripRequestStatus = (typeof TRIP_REQUEST_STATUSES)[number];

export interface TripRequest {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  trip_type: string;
  destinations: string[];
  group_size: number;
  duration_label: string | null;
  travel_month: string | null;
  budget_range: string | null;
  notes: string | null;
  package_slug: string | null;
  vehicle_type: string | null;
  hotel_category: string | null;
  computed_total: number | null;
  status: TripRequestStatus;
  created_at: string;
}

export interface AuditLog {
  id: number;
  actor_user_id: number | null;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  meta: string | null;
  created_at: string;
}
