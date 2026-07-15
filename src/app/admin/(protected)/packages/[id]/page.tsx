import { Package } from "lucide-react";
import { notFound } from "next/navigation";
import { packagesRepo } from "@/lib/db/queries/packages";
import { PackageForm } from "@/components/admin/PackageForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";

type Params = Promise<{ id: string }>;

export default async function EditPackagePage({ params }: { params: Params }) {
  await requireRole(["admin", "manager"]);
  const { id } = await params;
  const pkg = await packagesRepo.getById(Number(id));
  if (!pkg) notFound();

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <MotionIcon preset="pop" className="text-gold-700">
            <Package size={24} />
          </MotionIcon>
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Edit package</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <PackageForm pkg={pkg} />
        </div>
      </Reveal>
    </div>
  );
}
