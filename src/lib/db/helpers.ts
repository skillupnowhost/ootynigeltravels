export function parseJsonColumns<T extends object>(
  row: Record<string, unknown>,
  jsonKeys: (keyof T)[]
): T {
  const out: Record<string, unknown> = { ...row };
  for (const key of jsonKeys) {
    const raw = out[key as string];
    if (typeof raw === "string") {
      try {
        out[key as string] = JSON.parse(raw);
      } catch {
        out[key as string] = [];
      }
    }
  }
  return out as T;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Factory for the CRUD shape shared by simple slug-keyed content tables
 * (fleet, destinations, packages, blog_posts). Column names come only from
 * our own TypeScript field lists (never raw client JSON), so building the
 * INSERT/UPDATE column list dynamically stays safe from SQL injection.
 */
export function createSlugRepo<T extends { id: number; slug: string; active?: number }>(
  db: import("./client").WrappedDb,
  table: string,
  jsonKeys: (keyof T)[],
  orderBy = "id DESC"
) {
  const mapRow = (row: Record<string, unknown>): T => parseJsonColumns<T>(row, jsonKeys);

  return {
    list(activeOnly = false): T[] {
      const sql = activeOnly
        ? `SELECT * FROM ${table} WHERE active = 1 ORDER BY ${orderBy}`
        : `SELECT * FROM ${table} ORDER BY ${orderBy}`;
      return (db.prepare(sql).all() as Record<string, unknown>[]).map(mapRow);
    },
    getBySlug(slug: string): T | undefined {
      const row = db.prepare(`SELECT * FROM ${table} WHERE slug = ?`).get(slug) as
        | Record<string, unknown>
        | undefined;
      return row ? mapRow(row) : undefined;
    },
    getById(id: number): T | undefined {
      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as
        | Record<string, unknown>
        | undefined;
      return row ? mapRow(row) : undefined;
    },
    create(fields: Record<string, unknown>): T {
      const columns = Object.keys(fields);
      const serialized: Record<string, unknown> = {};
      for (const col of columns) {
        const value = fields[col];
        serialized[col] = jsonKeys.includes(col as keyof T)
          ? JSON.stringify(value ?? [])
          : value;
      }
      const placeholders = columns.map((c) => `@${c}`).join(", ");
      const result = db
        .prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`)
        .run(serialized);
      return this.getById(Number(result.lastInsertRowid))!;
    },
    update(id: number, fields: Record<string, unknown>): void {
      const columns = Object.keys(fields);
      if (columns.length === 0) return;
      const serialized: Record<string, unknown> = { id };
      for (const col of columns) {
        const value = fields[col];
        serialized[col] = jsonKeys.includes(col as keyof T)
          ? JSON.stringify(value ?? [])
          : value;
      }
      const setClause = columns.map((c) => `${c} = @${c}`).join(", ");
      db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = @id`).run(serialized);
    },
    remove(id: number): void {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    },
  };
}
