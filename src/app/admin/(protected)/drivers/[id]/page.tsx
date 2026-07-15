import { UserCog } from "lucide-react";
import { notFound } from "next/navigation";
import { getDriverById } from "@/lib/db/queries/drivers";
import { DriverForm } from "@/components/admin/DriverForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";

type Params = Promise<{ id: string }>;

export default async function EditDriverPage({ params }: { params: Params }) {
  await requireRole(["admin", "manager"]);
  const { id } = await params;
  const driver = await getDriverById(Number(id));
  if (!driver) notFound();

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <MotionIcon preset="pop" className="text-gold-700">
            <UserCog size={24} />
          </MotionIcon>
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Edit driver</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <DriverForm driver={driver} />
        </div>
      </Reveal>
    </div>
  );
}
