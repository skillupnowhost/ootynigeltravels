"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { SlidersHorizontal, ChevronDown, LayoutGrid, X, Wallet, Clock3, Users2, Car, ArrowUpDown } from "lucide-react";
import { PackageCard } from "@/components/packages/PackageCard";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { MotionIcon } from "@/components/ui/MotionIcon";
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

const ALL_KEY = "";

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
    initial && availableCategories.some((c) => c.key === initial) ? initial : ALL_KEY
  );
  const [showFilters, setShowFilters] = useState(false);
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [minTravellers, setMinTravellers] = useState(0);
  const [vehicleType, setVehicleType] = useState("");
  const [sort, setSort] = useState("popular");

  const filtered = useMemo(() => {
    const result = packages
      .filter((p) => active === ALL_KEY || p.category === active)
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
  const hasAnyFilters = active !== ALL_KEY || activeFilterCount > 0;

  function clearAll() {
    setActive(ALL_KEY);
    setBudget("");
    setDuration("");
    setMinTravellers(0);
    setVehicleType("");
  }

  return (
    <div>
      <LayoutGroup id="category-pills">
        <div
          className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] sm:mx-0 sm:px-0 sm:pb-0 sm:[mask-image:none] lg:flex-wrap"
          role="tablist"
          aria-label="Trip categories"
        >
          <CategoryPill active={active === ALL_KEY} onClick={() => setActive(ALL_KEY)}>
            <MotionIcon preset="pop">
              <LayoutGrid size={16} className={active === ALL_KEY ? "text-gold-400" : "text-forest-600"} />
            </MotionIcon>
            All Trips
          </CategoryPill>
          {availableCategories.map((c) => (
            <CategoryPill key={c.key} active={active === c.key} onClick={() => setActive(c.key)}>
              <span className={active === c.key ? "text-gold-400" : "text-forest-600"}>{c.icon(16)}</span>
              {c.label}
            </CategoryPill>
          ))}
          <Link
            href="/packages/customize"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-dashed border-gold-500 bg-gold-50 px-4 py-2 text-sm font-semibold text-gold-800 transition-all duration-300 hover:border-gold-600 hover:bg-gold-100"
          >
            {tripCategoryMeta("Customized")?.icon(16)}
            Customized Packages
          </Link>
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait">
        <motion.p
          key={active || "all"}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="mt-4 text-sm text-charcoal-500"
        >
          {active === ALL_KEY
            ? "Every trip style we run, in one place — filter to narrow it down."
            : tripCategoryMeta(active)?.blurb}
        </motion.p>
      </AnimatePresence>

      <div className="mt-6 overflow-hidden rounded-2xl border border-forest-100 bg-white">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-sm font-semibold text-forest-900"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gold-600" />
            Advanced filters
            {activeFilterCount > 0 && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-600 px-1.5 text-xs font-bold text-forest-950"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </span>
          <MotionIcon preset="tilt">
            <ChevronDown size={16} className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
          </MotionIcon>
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
                <FilterSelect icon={<Wallet size={13} />} label="Budget" value={budget} onChange={setBudget} options={BUDGET_BANDS} />
                <FilterSelect icon={<Clock3 size={13} />} label="Duration" value={duration} onChange={setDuration} options={DURATION_BUCKETS} />
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    <Users2 size={13} /> Travellers
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
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                    <Car size={13} /> Vehicle type
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
                <FilterSelect
                  icon={<ArrowUpDown size={13} />}
                  label="Sort by"
                  value={sort}
                  onChange={setSort}
                  options={SORTS.map((s) => ({ key: s.key, label: s.label }))}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={filtered.length}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium text-forest-800"
          >
            {filtered.length} {filtered.length === 1 ? "trip" : "trips"} found
          </motion.p>
        </AnimatePresence>
        {hasAnyFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 transition-colors hover:text-red-600"
          >
            <X size={13} />
            Clear all filters
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${active}-${budget}-${duration}-${minTravellers}-${vehicleType}-${sort}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease }}
          className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {filtered.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease }}
            >
              <PackageCard pkg={p} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-3xl border border-dashed border-forest-200 py-16 text-center">
              <MotionIcon preset="wiggle" loop>
                <SlidersHorizontal size={28} className="text-forest-300" />
              </MotionIcon>
              <p className="text-sm text-charcoal-500">No packages match these filters yet — try widening your search.</p>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-semibold text-gold-700 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
        active ? "border-forest-900 text-ivory-50" : "border-forest-200 bg-white text-forest-800 hover:border-forest-400"
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-category-bg"
          className="absolute inset-0 rounded-full bg-forest-900 shadow-[0_10px_24px_-10px_rgba(11,59,46,0.5)]"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
        {icon}
        {label}
      </label>
      <GlassSelect value={value} onChange={onChange} options={options.map((o) => ({ value: o.key, label: o.label }))} />
    </div>
  );
}
