import { db } from "../client";
import { parseJsonColumns } from "../helpers";
import type { Driver } from "../types";

function mapRow(row: Record<string, unknown>): Driver {
  return parseJsonColumns<Driver>(row, ["languages"]);
}

export async function listDrivers(opts: { activeOnly?: boolean } = {}): Promise<Driver[]> {
  const rows = opts.activeOnly
    ? ((await db
        .prepare("SELECT * FROM drivers WHERE active = 1 ORDER BY rating DESC")
        .all()) as Record<string, unknown>[])
    : ((await db
        .prepare("SELECT * FROM drivers ORDER BY created_at DESC")
        .all()) as Record<string, unknown>[]);
  return rows.map(mapRow);
}

export async function getDriverBySlug(slug: string): Promise<Driver | undefined> {
  const row = (await db.prepare("SELECT * FROM drivers WHERE slug = ?").get(slug)) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRow(row) : undefined;
}

export async function getDriverById(id: number): Promise<Driver | undefined> {
  const row = (await db.prepare("SELECT * FROM drivers WHERE id = ?").get(id)) as
    | Record<string, unknown>
    | undefined;
  return row ? mapRow(row) : undefined;
}

export interface DriverInput {
  slug: string;
  name: string;
  phone: string;
  license_no?: string | null;
  photo?: string | null;
  experience_years: number;
  languages: string[];
  rating: number;
  bio?: string | null;
  active?: boolean;
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const row = await db
    .prepare(
      `INSERT INTO drivers (slug, name, phone, license_no, photo, experience_years, languages, rating, bio, active)
       VALUES (@slug, @name, @phone, @license_no, @photo, @experience_years, @languages, @rating, @bio, @active)
       RETURNING *`
    )
    .get({
      slug: input.slug,
      name: input.name,
      phone: input.phone,
      license_no: input.license_no ?? null,
      photo: input.photo ?? null,
      experience_years: input.experience_years,
      languages: JSON.stringify(input.languages),
      rating: input.rating,
      bio: input.bio ?? null,
      active: input.active === false ? 0 : 1,
    });
  return mapRow(row);
}

export async function updateDriver(id: number, input: Partial<DriverInput>): Promise<void> {
  const existing = await getDriverById(id);
  if (!existing) throw new Error("Driver not found");
  const merged = { ...existing, ...input };
  await db.prepare(
    `UPDATE drivers SET name=@name, phone=@phone, license_no=@license_no, photo=@photo,
     experience_years=@experience_years, languages=@languages, rating=@rating, bio=@bio, active=@active
     WHERE id=@id`
  ).run({
    id,
    name: merged.name,
    phone: merged.phone,
    license_no: merged.license_no ?? null,
    photo: merged.photo ?? null,
    experience_years: merged.experience_years,
    languages: JSON.stringify(merged.languages ?? []),
    rating: merged.rating,
    bio: merged.bio ?? null,
    active: (merged as { active: number | boolean }).active === false ? 0 : 1,
  });
}

export async function deleteDriver(id: number): Promise<void> {
  await db.prepare("DELETE FROM drivers WHERE id = ?").run(id);
}
