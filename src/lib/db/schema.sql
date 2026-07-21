-- Ooty Nigel Travels — Postgres schema
-- Applied idempotently by scripts/migrate.mjs

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('admin','manager','staff','customer')),
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  email         TEXT,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  token_hash  TEXT NOT NULL UNIQUE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id                SERIAL PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  license_no        TEXT,
  photo             TEXT,
  experience_years  INTEGER NOT NULL DEFAULT 0,
  languages         TEXT NOT NULL DEFAULT '[]',
  rating            REAL NOT NULL DEFAULT 4.8,
  bio               TEXT,
  active            INTEGER NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fleet (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,
  seats          INTEGER NOT NULL,
  luggage        TEXT,
  price_per_day  INTEGER NOT NULL,
  model_kind     TEXT NOT NULL DEFAULT 'icon' CHECK (model_kind IN ('3d','photo','icon')),
  hero_asset     TEXT,
  gallery        TEXT NOT NULL DEFAULT '[]',
  features       TEXT NOT NULL DEFAULT '[]',
  active         INTEGER NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destinations (
  id                  SERIAL PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  region              TEXT,
  description         TEXT,
  image               TEXT,
  highlights          TEXT NOT NULL DEFAULT '[]',
  best_season         TEXT,
  distance_from_ooty  TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  active              INTEGER NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destination_images (
  id              SERIAL PRIMARY KEY,
  destination_id  INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  src             TEXT NOT NULL,
  alt             TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_destination_images_destination ON destination_images(destination_id);

CREATE TABLE IF NOT EXISTS attractions (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  blurb       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attraction_images (
  id             SERIAL PRIMARY KEY,
  attraction_id  INTEGER NOT NULL REFERENCES attractions(id) ON DELETE CASCADE,
  src            TEXT NOT NULL,
  alt            TEXT NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  active         INTEGER NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attraction_images_attraction ON attraction_images(attraction_id);

CREATE TABLE IF NOT EXISTS packages (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  tagline       TEXT,
  summary       TEXT,
  description   TEXT,
  duration_label TEXT,
  price_from    INTEGER NOT NULL,
  hero_image    TEXT,
  category      TEXT,
  itinerary     TEXT NOT NULL DEFAULT '[]',
  includes      TEXT NOT NULL DEFAULT '[]',
  excludes      TEXT NOT NULL DEFAULT '[]',
  faqs          TEXT NOT NULL DEFAULT '[]',
  highlights    TEXT NOT NULL DEFAULT '[]',
  gallery          TEXT NOT NULL DEFAULT '[]',
  original_price   INTEGER,
  rating           REAL NOT NULL DEFAULT 4.8,
  review_count     INTEGER NOT NULL DEFAULT 0,
  vehicle_options  TEXT NOT NULL DEFAULT '[]',
  max_group_size   INTEGER,
  duration_days    INTEGER,
  distance_label   TEXT,
  pickup_drop      TEXT,
  driver_info      TEXT,
  best_time        TEXT,
  places_covered   TEXT NOT NULL DEFAULT '[]',
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  pct         INTEGER NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  note        TEXT,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id               SERIAL PRIMARY KEY,
  booking_code     TEXT NOT NULL UNIQUE,
  customer_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  guest_name       TEXT NOT NULL,
  guest_phone      TEXT NOT NULL,
  guest_email      TEXT,
  package_id       INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  fleet_id         INTEGER REFERENCES fleet(id) ON DELETE SET NULL,
  destination      TEXT,
  travel_date      DATE NOT NULL,
  end_date         DATE,
  pickup_location  TEXT NOT NULL,
  pickup_time      TEXT,
  adults           INTEGER NOT NULL DEFAULT 1,
  children         INTEGER NOT NULL DEFAULT 0,
  estimate_amount  INTEGER NOT NULL DEFAULT 0,
  coupon_code      TEXT,
  status           TEXT NOT NULL DEFAULT 'Pending',
  payment_status   TEXT NOT NULL DEFAULT 'Unpaid',
  driver_id        INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_number   TEXT,
  remarks          TEXT,
  itinerary        TEXT NOT NULL DEFAULT '[]',
  cancel_requested INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(guest_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);

CREATE TABLE IF NOT EXISTS booking_history (
  id          SERIAL PRIMARY KEY,
  booking_id  INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email         TEXT,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL,
  package_id    INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  source        TEXT NOT NULL DEFAULT 'website',
  approved      INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS email TEXT;

CREATE TABLE IF NOT EXISTS contact_messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  handled     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL,
  cover_image   TEXT,
  author        TEXT,
  read_minutes  INTEGER NOT NULL DEFAULT 4,
  tags          TEXT NOT NULL DEFAULT '[]',
  category      TEXT NOT NULL DEFAULT 'Guides',
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL,
  src         TEXT NOT NULL,
  alt         TEXT NOT NULL,
  caption     TEXT,
  credit      TEXT,
  featured    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);

CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL DEFAULT 'General',
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trip_requests (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  trip_type      TEXT NOT NULL,
  destinations   TEXT NOT NULL DEFAULT '[]',
  group_size     INTEGER NOT NULL DEFAULT 2,
  duration_label TEXT,
  travel_month   TEXT,
  budget_range   TEXT,
  notes          TEXT,
  package_slug   TEXT,
  vehicle_type   TEXT,
  hotel_category TEXT,
  computed_total INTEGER,
  status         TEXT NOT NULL DEFAULT 'New',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id             SERIAL PRIMARY KEY,
  actor_user_id  INTEGER,
  actor_name     TEXT,
  action         TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  entity_id      TEXT,
  meta           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

CREATE TABLE IF NOT EXISTS pickup_locations (
  id          SERIAL PRIMARY KEY,
  city        TEXT NOT NULL,
  label       TEXT NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickup_locations_city ON pickup_locations(city);

CREATE TABLE IF NOT EXISTS package_pricing_tiers (
  id          SERIAL PRIMARY KEY,
  package_id  INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  nights      INTEGER NOT NULL,
  days        INTEGER NOT NULL,
  price       INTEGER NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_package ON package_pricing_tiers(package_id);

-- OTP/phone-verification was tried and removed; this drops the table it used
-- so re-running this script against the DB it was briefly live on cleans it up.
DROP TABLE IF EXISTS phone_verifications;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_type TEXT NOT NULL DEFAULT 'package';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pricing_tier_id INTEGER REFERENCES package_pricing_tiers(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS car_type TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS car_days TEXT NOT NULL DEFAULT '[]';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS car_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_charges INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_charges_note TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_amount INTEGER;
ALTER TABLE bookings DROP COLUMN IF EXISTS phone_verified;

ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS quotation_amount INTEGER;
ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS quotation_note TEXT;
ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS quotation_sent_at TIMESTAMPTZ;
ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE trip_requests ADD COLUMN IF NOT EXISTS end_date DATE;

-- The site now collects phone numbers internationally (E.164, e.g. +919876543210)
-- instead of bare 10-digit Indian numbers. Normalize any pre-existing guest/trip-request/
-- contact-message numbers left over from the old India-only format so every phone
-- column is consistently E.164. Idempotent: only touches values that are still exactly
-- 10 bare digits, so re-running this script is always a no-op after the first pass.
-- users.phone (staff/customer login) is deliberately left untouched — login stays India-only.
UPDATE bookings SET guest_phone = '+91' || guest_phone WHERE guest_phone ~ '^[0-9]{10}$';
UPDATE trip_requests SET phone = '+91' || phone WHERE phone ~ '^[0-9]{10}$';
UPDATE contact_messages SET phone = '+91' || phone WHERE phone ~ '^[0-9]{10}$';
