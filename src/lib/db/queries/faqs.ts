import { db } from "../client";
import type { Faq } from "../types";

export async function listFaqs(): Promise<Faq[]> {
  return (await db
    .prepare("SELECT * FROM faqs ORDER BY category ASC, sort_order ASC")
    .all()) as Faq[];
}

export async function createFaq(input: {
  category: string;
  question: string;
  answer: string;
  sort_order?: number;
}): Promise<Faq> {
  return (await db
    .prepare(
      `INSERT INTO faqs (category, question, answer, sort_order) VALUES (@category, @question, @answer, @sort_order)
       RETURNING *`
    )
    .get({
      category: input.category,
      question: input.question,
      answer: input.answer,
      sort_order: input.sort_order ?? 0,
    })) as Faq;
}

export async function deleteFaq(id: number): Promise<void> {
  await db.prepare("DELETE FROM faqs WHERE id = ?").run(id);
}
