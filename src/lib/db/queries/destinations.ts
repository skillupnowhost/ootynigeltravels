import { db } from "../client";
import { createSlugRepo } from "../helpers";
import type { Destination } from "../types";

export const destinationsRepo = createSlugRepo<Destination>(
  db,
  "destinations",
  ["highlights"],
  "sort_order ASC, id ASC"
);
