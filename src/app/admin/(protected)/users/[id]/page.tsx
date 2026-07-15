import { ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { getUserById } from "@/lib/db/queries/users";
import { StaffUserEditForm } from "@/components/admin/StaffUserEditForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { MotionIcon } from "@/components/ui/MotionIcon";

type Params = Promise<{ id: string }>;

export default async function EditStaffUserPage({ params }: { params: Params }) {
  await requireRole(["admin"]);
  const { id } = await params;
  const user = await getUserById(Number(id));
  if (!user || user.role === "customer") notFound();

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <MotionIcon preset="pop" className="text-gold-700">
            <ShieldCheck size={24} />
          </MotionIcon>
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Edit staff user</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <StaffUserEditForm user={user} />
        </div>
      </Reveal>
    </div>
  );
}
