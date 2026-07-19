"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Navigation, Satellite, PersonStanding, ParkingCircle } from "lucide-react";
import { MapPinDropIcon } from "@/components/ui/AnimatedIcons";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { site, mapEmbedUrl, mapDirectionsUrl, mapSatelliteUrl, mapStreetViewUrl } from "@/lib/config/site";

export interface NearbyAttraction {
  slug: string;
  name: string;
  category: string;
  image: string | null;
}

export function ContactMap({ nearbyAttractions }: { nearbyAttractions: NearbyAttraction[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-forest-100 shadow-[0_24px_60px_-30px_rgba(11,59,46,0.35)]"
      >
        <iframe
          title={`${site.name} — map location`}
          src={mapEmbedUrl()}
          width="100%"
          height="100%"
          loading="lazy"
          className="aspect-[4/3] w-full sm:aspect-[16/10]"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Custom marker card overlay */}
        <div className="glass-card pointer-events-none absolute left-4 top-4 flex max-w-[240px] items-start gap-2.5 rounded-2xl p-3.5 shadow-[0_16px_36px_-16px_rgba(11,59,46,0.4)]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-gold-400">
            <MapPinDropIcon size={18} />
          </span>
          <div>
            <p className="text-xs font-semibold text-forest-950">{site.name}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-charcoal-500">{site.addressLine1}</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          <a
            href={mapDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2 text-xs font-semibold text-ivory-50 shadow-[0_10px_24px_-8px_rgba(11,59,46,0.6)] transition-all hover:-translate-y-0.5 hover:bg-forest-800"
          >
            <MotionIcon preset="tilt">
              <Navigation size={14} />
            </MotionIcon>
            Get Directions
          </a>
          <a
            href={mapSatelliteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-forest-900 shadow-[0_10px_24px_-8px_rgba(11,59,46,0.35)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            <Satellite size={14} />
            Satellite View
          </a>
          <a
            href={mapStreetViewUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-forest-900 shadow-[0_10px_24px_-8px_rgba(11,59,46,0.35)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            <PersonStanding size={14} />
            Street View
          </a>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-forest-100 bg-white/80 p-5 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 text-forest-900">
            <ParkingCircle size={18} className="text-gold-600" />
            <p className="font-display text-base">Parking &amp; Access</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-charcoal-500">
            Complimentary parking is available directly outside our office for guests and
            arriving vehicles. You&rsquo;ll find us on Elk Hill Road, near JSS College — step
            inside for tea while we finalise your itinerary.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-forest-100 bg-white/80 p-5 backdrop-blur-md"
        >
          <p className="font-display text-base text-forest-900">Nearby Attractions</p>
          <ul className="mt-3 space-y-3">
            {nearbyAttractions.map((a) => (
              <li key={a.slug} className="group flex items-center gap-3">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-forest-50">
                  {a.image && (
                    <Image src={a.image} alt="" fill sizes="40px" className="object-cover transition-transform duration-300 group-hover:scale-110" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-forest-950">{a.name}</p>
                  <p className="truncate text-xs text-charcoal-500">{a.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
