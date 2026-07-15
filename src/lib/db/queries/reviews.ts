import { db } from "../client";
import type { Review } from "../types";

export async function listApprovedReviews(limit?: number): Promise<Review[]> {
  const sql = `SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC${
    limit ? " LIMIT ?" : ""
  }`;
  return (limit
    ? await db.prepare(sql).all(limit)
    : await db.prepare(sql).all()) as Review[];
}

export async function listAllReviews(): Promise<Review[]> {
  return (await db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all()) as Review[];
}

export async function listReviewsForPackage(packageId: number, limit?: number): Promise<Review[]> {
  const sql = `SELECT * FROM reviews WHERE approved = 1 AND package_id = ? ORDER BY created_at DESC${
    limit ? " LIMIT ?" : ""
  }`;
  return (limit
    ? await db.prepare(sql).all(packageId, limit)
    : await db.prepare(sql).all(packageId)) as Review[];
}

export async function createReview(input: {
  customer_name: string;
  rating: number;
  comment: string;
  package_id?: number | null;
  source?: string;
  approved?: boolean;
}): Promise<Review> {
  return (await db
    .prepare(
      `INSERT INTO reviews (customer_name, rating, comment, package_id, source, approved)
       VALUES (@customer_name, @rating, @comment, @package_id, @source, @approved)
       RETURNING *`
    )
    .get({
      customer_name: input.customer_name,
      rating: input.rating,
      comment: input.comment,
      package_id: input.package_id ?? null,
      source: input.source ?? "website",
      approved: input.approved === false ? 0 : 1,
    })) as Review;
}

export async function setReviewApproved(id: number, approved: boolean): Promise<void> {
  await db.prepare("UPDATE reviews SET approved = ? WHERE id = ?").run(
    approved ? 1 : 0,
    id
  );
}

export async function deleteReview(id: number): Promise<void> {
  await db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
}

export async function averageRating(): Promise<{ average: number; count: number }> {
  const row = (await db
    .prepare("SELECT AVG(rating) as avg, COUNT(*) as c FROM reviews WHERE approved = 1")
    .get()) as { avg: number | null; c: number };
  return { average: row.avg ?? 5, count: row.c };
}
