export const ATTRACTION_CATEGORIES = [
  "Hill Town",
  "Region",
  "Viewpoint",
  "Lake",
  "Tea Culture",
  "Forest",
  "Garden",
  "Waterfall",
  "Wildlife",
  "Grassland",
  "Heritage",
] as const;

export type AttractionCategory = (typeof ATTRACTION_CATEGORIES)[number];
