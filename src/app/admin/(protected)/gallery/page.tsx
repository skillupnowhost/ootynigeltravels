import Link from "next/link";
import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { listGalleryImages } from "@/lib/db/queries/galleryImages";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { GalleryReorderButtons } from "@/components/admin/GalleryReorderButtons";
import { deleteGalleryImageAction } from "@/lib/actions/adminContent";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { galleryCategoryLabel } from "@/lib/data/galleryCategories";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireRole(["admin", "manager"]);
  const images = await listGalleryImages();
  const siblingIdsByCategory = new Map<string, number[]>();
  for (const img of images) {
    const list = siblingIdsByCategory.get(img.category) ?? [];
    list.push(img.id);
    siblingIdsByCategory.set(img.category, list);
  }
  const indexInCategory = (img: (typeof images)[number]) =>
    (siblingIdsByCategory.get(img.category) ?? []).indexOf(img.id);

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Gallery</h1>
          <Link
            href="/admin/gallery/new"
            className="flex items-center gap-1.5 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-ivory-50 transition-colors duration-200 hover:bg-forest-800"
          >
            <MotionIcon preset="pop">
              <Plus size={16} />
            </MotionIcon>
            Add image
          </Link>
        </div>

        {/* Card list on small screens */}
        <div className="mt-4 divide-y divide-forest-50 rounded-2xl border border-forest-100 bg-white sm:hidden">
          {images.map((img) => (
            <div key={img.id} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/admin/gallery/${img.id}`} className="block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-forest-50">
                <Image src={img.src} alt={img.alt} width={80} height={56} className="h-full w-full object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-forest-900">
                  {galleryCategoryLabel(img.category)}
                  {img.featured === 1 && <Star size={13} className="text-gold-600" fill="currentColor" />}
                </span>
                <p className="truncate text-xs text-charcoal-500">{img.alt}</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${img.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                  {img.active ? "Active" : "Hidden"}
                </span>
              </div>
              <GalleryReorderButtons
                category={img.category}
                siblingIds={siblingIdsByCategory.get(img.category) ?? []}
                index={indexInCategory(img)}
              />
              <DeleteButton action={deleteGalleryImageAction} id={img.id} confirmLabel={`Delete this photo?`} />
            </div>
          ))}
        </div>

        {/* Table on larger screens */}
        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-forest-100 bg-white sm:mt-6 sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-5 py-3">Photo</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Alt text</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr key={img.id} className="border-b border-forest-50 last:border-0 hover:bg-forest-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/gallery/${img.id}`} className="block h-14 w-20 overflow-hidden rounded-lg bg-forest-50">
                      <Image src={img.src} alt={img.alt} width={80} height={56} className="h-full w-full object-cover" />
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      {galleryCategoryLabel(img.category)}
                      {img.featured === 1 && <Star size={13} className="text-gold-600" fill="currentColor" />}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 text-charcoal-500">{img.alt}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${img.active ? "bg-forest-100 text-forest-800" : "bg-ivory-200 text-charcoal-500"}`}>
                      {img.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <GalleryReorderButtons
                        category={img.category}
                        siblingIds={siblingIdsByCategory.get(img.category) ?? []}
                        index={indexInCategory(img)}
                      />
                      <DeleteButton action={deleteGalleryImageAction} id={img.id} confirmLabel={`Delete this photo?`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
