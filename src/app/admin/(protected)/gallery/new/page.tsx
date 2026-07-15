import { Image as ImageIcon } from "lucide-react";
import { GalleryImageForm } from "@/components/admin/GalleryImageForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";

export default async function NewGalleryImagePage() {
  await requireRole(["admin", "manager"]);
  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <ImageIcon size={24} className="text-gold-700" />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Add image</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <GalleryImageForm />
        </div>
      </Reveal>
    </div>
  );
}
