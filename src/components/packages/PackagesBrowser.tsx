"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { PackageCard } from "@/components/packages/PackageCard";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { TRIP_CATEGORIES, tripCategoryMeta } from "@/lib/config/tripCategories";
import type { TourPackage } from "@/lib/db/types";

const ease = [0.22, 1, 0.36, 1] as const;

const BUDGET_BANDS = [
  { key: "", label: "Any budget" },
  { key: "under5", label: "Under ₹5,000" },
  { key: "5to15", label: "₹5,000 – ₹15,000" },
  { key: "15to30", label: "₹15,000 – ₹30,000" },
  { key: "30plus", label: "₹30,000+" },
];

function matchesBudget(price: number, band: string): boolean {
  if (band === "under5") return price < 5000;
  if (band === "5to15") return price >= 5000 && price < 15000;
  if (band === "15to30") return price >= 15000 && price < 30000;
  if (band === "30plus") return price >= 30000;
  return true;
}

const DURATION_BUCKETS = [
  { key: "", label: "Any duration" },
  { key: "half", label: "Half-day / 1 Day" },
  { key: "short", label: "2-3 Days" },
  { key: "long", label: "4+ Days" },
];

function matchesDuration(days: number | null, bucket: string): boolean {
  if (!bucket) return true;
  if (days == null) return false;
  if (bucket === "half") return days <= 1;
  if (bucket === "short") return days >= 2 && days <= 3;
  if (bucket === "long") return days >= 4;
  return true;
}

const SORTS = [
  { key: "popular", label: "Most Popular" },
  { key: "priceLow", label: "Price: Low to High" },
  { key: "priceHigh", label: "Price: High to Low" },
  { key: "rating", label: "Highest Rated" },
];

export function PackagesBrowser({
  packages,
  vehicleCategories,
}: {
  packages: TourPackage[];
  vehicleCategories: string[];
}) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("category");

  const availableCategories = useMemo(
    () => TRIP_CATEGORIES.filter((c) => !c.virtual && packages.some((p) => p.category === c.key)),
    [packages]
  );

  const [active, setActive] = useState<string>(
    initial && availableCategories.some((c) => c.key === initial) ? initial : availableCategories[0]?.key ?? ""
  );
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [minTravellers, setMinTravellers] = useState(0);
  const [vehicleType, setVehicleType] = useState("");
  const [sort, setSort] = useState("popular");

  const filtered = useMemo(() => {
    const result = packages
      .filter((p) => p.category === active)
      .filter((p) => matchesBudget(p.price_from, budget))
      .filter((p) => matchesDuration(p.duration_days, duration))
      .filter((p) => (minTravellers > 0 ? (p.max_group_size ?? 0) >= minTravellers : true))
      .filter((p) => (vehicleType ? p.vehicle_options.includes(vehicleType) : true));

    return [...result].sort((a, b) => {
      if (sort === "priceLow") return a.price_from - b.price_from;
      if (sort === "priceHigh") return b.price_from - a.price_from;
      if (sort === "rating") return b.rating - a.rating;
      return b.review_count - a.review_count;
    });
  }, [packages, active, budget, duration, minTravellers, vehicleType, sort]);

  const activeFilterCount = [budget, duration, vehicleType].filter(Boolean).length + (minTravellers > 0 ? 1 : 0);

  return (
    <div>
      <div
        className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0 lg:flex-wrap"
        role="tablist"
        aria-label="Trip categories"
      >
        {availableCategories.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={active === c.key}
            onClick={() => setActive(c.key)}
            className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
              active === c.key
                ? "border-forest-900 bg-forest-900 text-ivory-50 shadow-[0_10px_24px_-10px_rgba(11,59,46,0.5)]"
                : "border-forest-200 bg-white text-forest-800 hover:border-forest-400"
            }`}
          >
            <span className={active === c.key ? "text-gold-400" : "text-forest-600"}>{c.icon(16)}</span>
            {c.label}
          </button>
        ))}
        <Link
          href="/packages/customize"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-dashed border-gold-500 bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-800 transition-all duration-300 hover:border-gold-600 hover:bg-gold-100"
        >
          {tripCategoryMeta("Customized")?.icon(16)}
          Customized Packages
        </Link>
      </div>

      <p className="mt-4 text-sm text-charcoal-500">{tripCategoryMeta(active)?.blurb}</p>

      <div className="mt-6 rounded-2xl border border-forest-100 bg-white">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-sm font-semibold text-forest-900"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gold-600" />
            Advanced filters
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1.5 text-xs font-bold text-forest-950">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown size={16} className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 border-t border-forest-100 p-5 sm:grid-cols-2 lg:grid-cols-5">
                <FilterSelect label="Budget" value={budget} onChange={setBudget} options={BUDGET_BANDS} />
                <FilterSelect label="Duration" value={duration} onChange={setDuration} options={DURATION_BUCKETS} />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    Travellers
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={minTravellers || ""}
                    onChange={(e) => setMinTravellers(Number(e.target.value) || 0)}
                    placeholder="Any"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    Vehicle type
                  </label>
                  <GlassSelect
                    value={vehicleType}
                    onChange={setVehicleType}
                    options={[
                      { value: "", label: "Any vehicle" },
                      ...vehicleCategories.map((v) => ({ value: v, label: v })),
                    ]}
                  />
                </div>
                <FilterSelect label="Sort by" value={sort} onChange={setSort} options={SORTS.map((s) => ({ key: s.key, label: s.label }))} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${active}-${budget}-${duration}-${minTravellers}-${vehicleType}-${sort}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease }}
          className="mt-8 grid gap-6 lg:grid-cols-3"
        >
          {filtered.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease }}
            >
              <PackageCard pkg={p} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-charcoal-500">No packages match these filters yet — try widening your search.</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal-500">{label}</label>
      <GlassSelect value={value} onChange={onChange} options={options.map((o) => ({ value: o.key, label: o.label }))} />
    </div>
  );
}
