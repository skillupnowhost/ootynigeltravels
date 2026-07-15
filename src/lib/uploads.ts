import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveUploadedFile(file: File, section: string, slug: string): Promise<string> {
  const ext = ALLOWED_MIME_EXT[file.type];
  if (!ext) throw new Error("Only JPEG, PNG or WebP images are allowed.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image must be 5MB or smaller.");

  const dir = path.join(process.cwd(), "public", "uploads", section, slug);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${section}/${slug}/${filename}`;
}
