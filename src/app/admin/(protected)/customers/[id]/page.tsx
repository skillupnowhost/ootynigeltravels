import { notFound } from "next/navigation";
import { getUserById } from "@/lib/db/queries/users";
import { CustomerEditForm } from "@/components/admin/CustomerEditForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";
import { HeartBeatIcon } from "@/components/ui/AnimatedIcons";

type Params = Promise<{ id: string }>;

export default async function EditCustomerPage({ params }: { params: Params }) {
  await requireRole(["admin", "manager"]);
  const { id } = await params;
  const customer = getUserById(Number(id));
  if (!customer || customer.role !== "customer") notFound();

  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <HeartBeatIcon size={24} className="text-gold-700" loop={false} />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Edit customer</h1>
        </div>
        <div className="mt-4 sm:mt-6">
          <CustomerEditForm customer={customer} />
        </div>
      </Reveal>
    </div>
  );
}
