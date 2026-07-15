# Ooty Nigel Travels — Luxury Travel Platform

A cinematic, animated luxury travel-booking platform built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS 3**, a real **SQLite database**, and a full admin console.

## Quick start

```bash
npm install
npm run db:reset     # creates data/ooty.db and seeds sample content + a default admin user
npm run dev           # http://localhost:3000
```

`npm run db:reset` prints a generated admin phone/password once — save it, then sign in at `/admin/login`. Change the password afterwards (`npm run admin:create` to add another staff account; there's no self-service password change UI yet — update it directly via a new `db:` script or the database if needed).

Copy `.env.example` → `.env.local` and set `SESSION_SECRET` to a random 64-char hex string for production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Environment-specific notes (read before deploying elsewhere)

This project was built and tested on a Windows machine with an **Application Control policy that blocks unsigned native `.node` binaries** system-wide. That constraint shaped a few technical choices worth knowing about if you move to a different host:

- **Database: `node:sqlite` (Node's built-in module), not `better-sqlite3`.** `better-sqlite3` needs a native binary (blocked here, and would otherwise need a C++ toolchain). `node:sqlite` requires **Node.js 22.5+** — nothing else to install. If you'd rather use `better-sqlite3` or Postgres, the entire integration point is `src/lib/db/client.ts` + `src/lib/db/queries/*.ts`.
- **Bundler: Webpack, not Turbopack.** Turbopack's native bindings hit the same policy block, so `next dev`/`next build` both pass `--webpack` (see `package.json`). If Turbopack works in your environment, dropping `--webpack` should just work.
- **Tailwind CSS v3, not v4.** Tailwind v4's Rust-based "oxide" engine (even via its WASM fallback) could not scan the source tree for class names in this sandboxed environment — it silently produced zero utility classes. Tailwind v3's pure-JS engine has no such dependency. If v4 works fine in your environment, migrating back is a matter of restoring `@tailwindcss/postcss` + `@theme`/`@source` directives in `globals.css` and removing `tailwind.config.ts`.
- **3D hero materials/environment:** the Mercedes-Benz GLS model's photographic `Environment` preset (an HDRI-based reflection map) reliably crashed WebGL under headless/software rendering (`SwiftShader`). It's replaced with a synthetic studio rig built from `<Lightformer>` primitives (see `src/components/three/GLSScene.tsx`) — cheaper, no external HDRI fetch, and it looks intentional rather than like a workaround. Real GPUs will render either approach fine; this one is also more self-contained for production (no CDN dependency).

None of this should matter on a normal Linux/macOS CI or hosting box — `npm run dev`/`npm run build` without `--webpack` and with `better-sqlite3` should also work there if you prefer that path.

## What's inside

**Pages** — cinematic animated homepage (3D Mercedes GLS hero, floating stat cards, scroll-linked rotation), About, Fleet (+ per-vehicle detail with photo gallery or 3D-hero pointer), Signature Packages (+ itinerary/includes/FAQ detail pages), Destinations, Drivers, Gallery, Reviews (+ submission form), Blog/Journal, FAQ, Contact, Booking wizard, Booking tracker, customer Account (login/register/dashboard), 4 legal pages, sitemap/robots/manifest, custom 404/error pages.

**Booking system** — guest-first (no signup required), 3-field-group wizard, coupon codes, instant `ONT-YYMMDD-XXXX` booking ID, printable confirmation with WhatsApp/email links. Creating an account later automatically links prior guest bookings by phone number (no SMS/OTP step — see below).

**Database** — real SQLite schema (`src/lib/db/schema.sql`) covering users/sessions, bookings + status history, fleet, packages, destinations, drivers, coupons, reviews, contact messages, blog posts, FAQs, and an audit log. CLI tools: `npm run db:migrate`, `db:seed`, `db:reset`, `db:backup`, `admin:create`.

**Admin console** (`/admin`) — role-gated (admin / manager / staff) dashboard, booking management (status, driver/vehicle assignment, payment status, remarks), fleet/packages/drivers/coupons CRUD, customer list, review moderation, contact inbox, reports (revenue, popularity), a full audit log, and staff user management (admin-only). Every mutation is authorization-checked **and** recorded to the audit log server-side — the admin nav sidebar hiding links for a role is a convenience, not the actual security boundary.

**Integrations** — WhatsApp click-to-chat (`wa.me` links, live today, no API key needed). Booking "confirmation email" is a prefilled `mailto:` link rather than server-sent SMTP, and phone verification for account linking is a direct match rather than an OTP flow — both were explicit scope decisions (no third-party SMS/email credentials were available in this environment). Wiring up a real SMTP/OTP provider is a matter of adding the provider call inside `src/lib/actions/booking.ts` / `src/lib/actions/account.ts`.

## Content

Business contact details in `src/lib/config/site.ts` and all seed content in `scripts/seed.mjs` (packages, fleet, drivers, destinations, blog, FAQs, coupons) are **original placeholder content** — update both before going live. Only the Mercedes-Benz GLS (3D model) and Audi A3 (photography) have real assets; the rest of the fleet roster is presented with icon-based cards rather than stock photography, on purpose.

## Going live — checklist

1. Replace placeholder business details in `src/lib/config/site.ts`.
2. Replace/extend seed content in `scripts/seed.mjs`, or manage it entirely through `/admin` after the first deploy.
3. Set a strong `SESSION_SECRET` and deploy behind HTTPS.
4. Decide on SMTP/SMS providers if you want live email/OTP (see above) — currently both are stubbed to safe, functional fallbacks.
5. Back up `data/ooty.db` regularly (`npm run db:backup`) or move to a managed database for multi-instance deployments.
