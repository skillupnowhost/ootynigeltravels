import { db } from "../client";
import { parseJsonColumns } from "../helpers";
import type { TripRequest, TripRequestStatus } from "../types";

function mapRow(row: Record<string, unknown>): TripRequest {
  return parseJsonColumns<TripRequest>(row, ["destinations"]);
}

export async function listTripRequests(): Promise<TripRequest[]> {
  return (
    (await db.prepare("SELECT * FROM trip_requests ORDER BY created_at DESC").all()) as Record<
      string,
      unknown
    >[]
  ).map(mapRow);
}

export async function createTripRequest(input: {
  name: string;
  phone: string;
  email?: string | null;
  trip_type: string;
  destinations: string[];
  group_size: number;
  duration_label?: string | null;
  travel_month?: string | null;
  budget_range?: string | null;
  notes?: string | null;
  package_slug?: string | null;
  vehicle_type?: string | null;
  hotel_category?: string | null;
  computed_total?: number | null;
}): Promise<TripRequest> {
  const row = (await db
    .prepare(
      `INSERT INTO trip_requests (name, phone, email, trip_type, destinations, group_size, duration_label, travel_month, budget_range, notes, package_slug, vehicle_type, hotel_category, computed_total)
       VALUES (@name, @phone, @email, @trip_type, @destinations, @group_size, @duration_label, @travel_month, @budget_range, @notes, @package_slug, @vehicle_type, @hotel_category, @computed_total)
       RETURNING *`
    )
    .get({
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      trip_type: input.trip_type,
      destinations: JSON.stringify(input.destinations ?? []),
      group_size: input.group_size,
      duration_label: input.duration_label ?? null,
      travel_month: input.travel_month ?? null,
      budget_range: input.budget_range ?? null,
      notes: input.notes ?? null,
      package_slug: input.package_slug ?? null,
      vehicle_type: input.vehicle_type ?? null,
      hotel_category: input.hotel_category ?? null,
      computed_total: input.computed_total ?? null,
    })) as Record<string, unknown>;
  return mapRow(row);
}

export async function setTripRequestStatus(id: number, status: TripRequestStatus): Promise<void> {
  await db.prepare("UPDATE trip_requests SET status = ? WHERE id = ?").run(status, id);
}

export async function deleteTripRequest(id: number): Promise<void> {
  await db.prepare("DELETE FROM trip_requests WHERE id = ?").run(id);
}
