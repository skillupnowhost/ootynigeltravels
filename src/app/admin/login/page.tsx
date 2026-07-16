import { redirect } from "next/navigation";
import { getCurrentUser, STAFF_ROLES } from "@/lib/auth/session";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user && STAFF_ROLES.includes(user.role)) redirect("/admin");

  return <AdminLoginForm />;
}
