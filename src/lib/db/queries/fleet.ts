import { db } from "../client";
import { createSlugRepo } from "../helpers";
import type { FleetVehicle } from "../types";

export const fleetRepo = createSlugRepo<FleetVehicle>(db, "fleet", [
  "gallery",
  "features",
]);
