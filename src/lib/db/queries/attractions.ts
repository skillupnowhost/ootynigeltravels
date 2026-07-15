import { db } from "../client";
import { createSlugRepo } from "../helpers";
import type { Attraction } from "../types";

export const attractionsRepo = createSlugRepo<Attraction>(
  db,
  "attractions",
  [],
  "sort_order ASC, id ASC"
);
