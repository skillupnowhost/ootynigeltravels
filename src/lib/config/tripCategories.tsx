import type { ReactNode } from "react";
import {
  FamilyGroupIcon,
  HeartBeatIcon,
  MountainSunIcon,
  FriendsGroupIcon,
  SparkleBurstIcon,
  CalendarCheckIcon,
  TeaSteamIcon,
  CompassIcon,
  PeopleGroupIcon,
  PawPrintIcon,
  HillPeakIcon,
  CrownIcon,
  WalletIcon,
  BriefcaseIcon,
  BackpackIcon,
} from "@/components/ui/AnimatedIcons";

export type TripCategoryKey =
  | "Family"
  | "Couple"
  | "Honeymoon"
  | "Friends"
  | "Adventure"
  | "Group"
  | "Weekend"
  | "Wildlife"
  | "NatureTea"
  | "HillStation"
  | "Luxury"
  | "Budget"
  | "Corporate"
  | "Student"
  | "Customized";

export interface TripCategoryMeta {
  key: TripCategoryKey;
  label: string;
  blurb: string;
  icon: (size?: number) => ReactNode;
  /** True for the virtual "build your own" tab that links out instead of filtering packages. */
  virtual?: boolean;
}

export const TRIP_CATEGORIES: TripCategoryMeta[] = [
  {
    key: "Family",
    label: "Family Trips",
    blurb: "Gentle pacing, easy-access sights, and something for every age.",
    icon: (size = 20) => <FamilyGroupIcon size={size} />,
  },
  {
    key: "Couple",
    label: "Couple Trips",
    blurb: "Quiet lakesides, scenic drives, and unhurried time together.",
    icon: (size = 20) => <HeartBeatIcon size={size} />,
  },
  {
    key: "Honeymoon",
    label: "Honeymoon Packages",
    blurb: "Golden-hour viewpoints and private, celebratory itineraries.",
    icon: (size = 20) => <SparkleBurstIcon size={size} />,
  },
  {
    key: "Friends",
    label: "Friends Trips",
    blurb: "Viewpoint-hopping, group photo stops, and a lively full-day loop.",
    icon: (size = 20) => <FriendsGroupIcon size={size} />,
  },
  {
    key: "Adventure",
    label: "Adventure Trips",
    blurb: "Forest trails, jungle rides, and the Nilgiris beyond the postcards.",
    icon: (size = 20) => <MountainSunIcon size={size} />,
  },
  {
    key: "Group",
    label: "Group Tours",
    blurb: "Larger parties, shared vehicles, and itineraries built for numbers.",
    icon: (size = 20) => <PeopleGroupIcon size={size} />,
  },
  {
    key: "Weekend",
    label: "Weekend Getaways",
    blurb: "Short, scheduled escapes that make the most of two days.",
    icon: (size = 20) => <CalendarCheckIcon size={size} />,
  },
  {
    key: "Wildlife",
    label: "Wildlife Tours",
    blurb: "Sanctuary safaris and sightings across the Nilgiri Biosphere.",
    icon: (size = 20) => <PawPrintIcon size={size} />,
  },
  {
    key: "NatureTea",
    label: "Nature & Tea Estate Tours",
    blurb: "Rolling tea gardens, factory visits, and misty plantation trails.",
    icon: (size = 20) => <TeaSteamIcon size={size} />,
  },
  {
    key: "HillStation",
    label: "Hill Station Tours",
    blurb: "Classic Nilgiri peaks, viewpoints, and cool-climate towns.",
    icon: (size = 20) => <HillPeakIcon size={size} />,
  },
  {
    key: "Luxury",
    label: "Luxury Tours",
    blurb: "Premium stays, private vehicles, and a fully curated pace.",
    icon: (size = 20) => <CrownIcon size={size} />,
  },
  {
    key: "Budget",
    label: "Budget Tours",
    blurb: "Smart itineraries that keep the essentials without the excess.",
    icon: (size = 20) => <WalletIcon size={size} />,
  },
  {
    key: "Corporate",
    label: "Corporate Tours",
    blurb: "Offsites, retreats, and tracked transfers for teams.",
    icon: (size = 20) => <BriefcaseIcon size={size} />,
  },
  {
    key: "Student",
    label: "Student Trips",
    blurb: "Budget-friendly group educational and leisure excursions.",
    icon: (size = 20) => <BackpackIcon size={size} />,
  },
  {
    key: "Customized",
    label: "Customized Packages",
    blurb: "Tell us what you have in mind — we'll build it around you.",
    icon: (size = 20) => <CompassIcon size={size} />,
    virtual: true,
  },
];

export function tripCategoryMeta(key: string | null | undefined): TripCategoryMeta | undefined {
  return TRIP_CATEGORIES.find((c) => c.key === key);
}
