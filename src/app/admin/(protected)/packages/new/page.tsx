import { Package } from "lucide-react";
import { PackageForm } from "@/components/admin/PackageForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";

export default async function NewPackagePage() {
  await requireRole(["admin", "manager"]);
  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <MotionIcon preset="pop" className="text-gold-700">
            <Package size={24} />
          </MotionIcon>
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Add package</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <PackageForm />
        </div>
      </Reveal>
    </div>
  );
}
