import { notFound } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { getGalleryImageById } from "@/lib/db/queries/galleryImages";
import { GalleryImageForm } from "@/components/admin/GalleryImageForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";

type Params = Promise<{ id: string }>;

export default async function EditGalleryImagePage({ params }: { params: Params }) {
  await requireRole(["admin", "manager"]);
  const { id } = await params;
  const image = getGalleryImageById(Number(id));
  if (!image) notFound();

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <ImageIcon size={24} className="text-gold-700" />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Edit image</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <GalleryImageForm image={image} />
        </div>
      </Reveal>
    </div>
  );
}
