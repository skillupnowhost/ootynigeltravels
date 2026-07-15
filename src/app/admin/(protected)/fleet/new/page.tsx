import { FleetForm } from "@/components/admin/FleetForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { CarDriveIcon } from "@/components/ui/AnimatedIcons";

export default async function NewFleetPage() {
  await requireRole(["admin", "manager"]);
  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <CarDriveIcon size={26} className="text-gold-700" loop={false} />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Add vehicle</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <FleetForm />
        </div>
      </Reveal>
    </div>
  );
}
