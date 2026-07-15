"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { MotionIcon } from "@/components/ui/MotionIcon";

export function DeleteButton({
  action,
  id,
  confirmLabel = "Are you sure?",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  confirmLabel?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmLabel)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteSubmitButton />
    </form>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Delete"
      aria-busy={pending}
      className="rounded-lg p-1.5 text-charcoal-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <MotionIcon preset={pending ? "spin" : "wiggle"} loop={pending}>
        <Trash2 size={16} />
      </MotionIcon>
    </button>
  );
}
