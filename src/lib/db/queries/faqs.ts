import { db } from "../client";
import type { Faq } from "../types";

export function listFaqs(): Faq[] {
  return db
    .prepare("SELECT * FROM faqs ORDER BY category ASC, sort_order ASC")
    .all() as Faq[];
}

export function createFaq(input: {
  category: string;
  question: string;
  answer: string;
  sort_order?: number;
}): Faq {
  const result = db
    .prepare(
      `INSERT INTO faqs (category, question, answer, sort_order) VALUES (@category, @question, @answer, @sort_order)`
    )
    .run({
      category: input.category,
      question: input.question,
      answer: input.answer,
      sort_order: input.sort_order ?? 0,
    });
  return db
    .prepare("SELECT * FROM faqs WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as Faq;
}

export function deleteFaq(id: number): void {
  db.prepare("DELETE FROM faqs WHERE id = ?").run(id);
}
