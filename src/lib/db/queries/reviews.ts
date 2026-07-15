import { db } from "../client";
import type { Review } from "../types";

export function listApprovedReviews(limit?: number): Review[] {
  const sql = `SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC${
    limit ? " LIMIT ?" : ""
  }`;
  return (limit
    ? db.prepare(sql).all(limit)
    : db.prepare(sql).all()) as Review[];
}

export function listAllReviews(): Review[] {
  return db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all() as Review[];
}

export function listReviewsForPackage(packageId: number, limit?: number): Review[] {
  const sql = `SELECT * FROM reviews WHERE approved = 1 AND package_id = ? ORDER BY created_at DESC${
    limit ? " LIMIT ?" : ""
  }`;
  return (limit
    ? db.prepare(sql).all(packageId, limit)
    : db.prepare(sql).all(packageId)) as Review[];
}

export function createReview(input: {
  customer_name: string;
  rating: number;
  comment: string;
  package_id?: number | null;
  source?: string;
  approved?: boolean;
}): Review {
  const result = db
    .prepare(
      `INSERT INTO reviews (customer_name, rating, comment, package_id, source, approved)
       VALUES (@customer_name, @rating, @comment, @package_id, @source, @approved)`
    )
    .run({
      customer_name: input.customer_name,
      rating: input.rating,
      comment: input.comment,
      package_id: input.package_id ?? null,
      source: input.source ?? "website",
      approved: input.approved === false ? 0 : 1,
    });
  return db
    .prepare("SELECT * FROM reviews WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as Review;
}

export function setReviewApproved(id: number, approved: boolean): void {
  db.prepare("UPDATE reviews SET approved = ? WHERE id = ?").run(
    approved ? 1 : 0,
    id
  );
}

export function deleteReview(id: number): void {
  db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
}

export function averageRating(): { average: number; count: number } {
  const row = db
    .prepare("SELECT AVG(rating) as avg, COUNT(*) as c FROM reviews WHERE approved = 1")
    .get() as { avg: number | null; c: number };
  return { average: row.avg ?? 5, count: row.c };
}
