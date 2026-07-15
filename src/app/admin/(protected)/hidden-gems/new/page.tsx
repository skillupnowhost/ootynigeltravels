import { Sparkles } from "lucide-react";
import { AttractionForm } from "@/components/admin/AttractionForm";
import { requireRole } from "@/lib/auth/rbac";
import { Reveal } from "@/components/ui/Reveal";

export default async function NewHiddenGemPage() {
  await requireRole(["admin", "manager"]);
  return (
    <div>
      <Reveal>
        <div className="flex items-center gap-3">
          <Sparkles size={24} className="text-gold-700" />
          <h1 className="font-display text-xl text-forest-950 sm:text-2xl">Add hidden gem</h1>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-charcoal-500">
          Save it first, then add up to 5 photos from its detail page.
        </p>
        <div className="mt-4 sm:mt-6">
          <AttractionForm />
        </div>
      </Reveal>
    </div>
  );
}
