import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { attractionsRepo } from "@/lib/db/queries/attractions";
import { listAttractionImages } from "@/lib/db/queries/attractionImages";
import { AttractionForm } from "@/components/admin/AttractionForm";
import { CardImageManager } from "@/components/admin/CardImageManager";
import {
  uploadAttractionImageAction,
  updateAttractionImageAction,
  deleteAttractionImageAction,
  reorderAttractionImagesAction,
} from "@/lib/actions/adminMedia";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";

type Params = Promise<{ id: string }>;

export default async function EditHiddenGemPage({ params }: { params: Params }) {
  await requireRole(["admin", "manager"]);
  const { id } = await params;
  const attraction = await attractionsRepo.getById(Number(id));
  if (!attraction) notFound();
  const images = await listAttractionImages(attraction.id);

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <Sparkles size={24} className="text-gold-700" />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">{attraction.name}</h1>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:mt-6 xl:grid-cols-2 xl:items-start">
          <AttractionForm attraction={attraction} />
          <CardImageManager
            parentId={attraction.id}
            parentIdField="attraction_id"
            images={images}
            uploadAction={uploadAttractionImageAction}
            updateAction={updateAttractionImageAction}
            deleteAction={deleteAttractionImageAction}
            reorderAction={reorderAttractionImagesAction}
          />
        </div>
      </Reveal>
    </div>
  );
}
