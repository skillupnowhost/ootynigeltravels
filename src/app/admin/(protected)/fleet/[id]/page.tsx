import { notFound } from "next/navigation";
import { fleetRepo } from "@/lib/db/queries/fleet";
import { FleetForm } from "@/components/admin/FleetForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { CarDriveIcon } from "@/components/ui/AnimatedIcons";

type Params = Promise<{ id: string }>;

export default async function EditFleetPage({ params }: { params: Params }) {
  await requireRole(["admin", "manager"]);
  const { id } = await params;
  const vehicle = fleetRepo.getById(Number(id));
  if (!vehicle) notFound();

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <CarDriveIcon size={26} className="text-gold-700" loop={false} />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Edit vehicle</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <FleetForm vehicle={vehicle} />
        </div>
      </Reveal>
    </div>
  );
}
