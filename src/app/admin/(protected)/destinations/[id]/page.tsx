import { notFound } from "next/navigation";
import { MapPinned } from "lucide-react";
import { destinationsRepo } from "@/lib/db/queries/destinations";
import { listDestinationImages } from "@/lib/db/queries/destinationImages";
import { DestinationForm } from "@/components/admin/DestinationForm";
import { CardImageManager } from "@/components/admin/CardImageManager";
import {
  uploadDestinationImageAction,
  updateDestinationImageAction,
  deleteDestinationImageAction,
  reorderDestinationImagesAction,
} from "@/lib/actions/adminMedia";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";

type Params = Promise<{ id: string }>;

export default async function EditDestinationPage({ params }: { params: Params }) {
  await requireRole(["admin", "manager"]);
  const { id } = await params;
  const destination = await destinationsRepo.getById(Number(id));
  if (!destination) notFound();
  const images = await listDestinationImages(destination.id);

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <MapPinned size={24} className="text-gold-700" />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">{destination.name}</h1>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:mt-6 xl:grid-cols-2 xl:items-start">
          <DestinationForm destination={destination} />
          <CardImageManager
            parentId={destination.id}
            parentIdField="destination_id"
            images={images}
            uploadAction={uploadDestinationImageAction}
            updateAction={updateDestinationImageAction}
            deleteAction={deleteDestinationImageAction}
            reorderAction={reorderDestinationImagesAction}
          />
        </div>
      </Reveal>
    </div>
  );
}
