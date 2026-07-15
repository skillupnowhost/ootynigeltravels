"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { changePasswordAction, type AuthFormState } from "@/lib/actions/account";
import { PasswordField } from "@/components/forms/AuthForms";
import { Button } from "@/components/ui/Button";

const initial: AuthFormState = { ok: false };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <PasswordField label="Current password" name="currentPassword" icon={<Lock size={16} />} />
      <PasswordField label="New password" name="newPassword" icon={<Lock size={16} />} />
      <PasswordField label="Confirm new password" name="confirmNewPassword" icon={<Lock size={16} />} />

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-xl bg-forest-50 px-3 py-2 text-sm text-forest-700">
          <CheckCircle2 size={16} className="shrink-0" />
          Password updated.
        </p>
      )}
      <Button type="submit" variant="forest" icon={false} disabled={pending} className="px-6 py-3">
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
