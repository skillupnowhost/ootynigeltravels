"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Phone, Lock, User as UserIcon, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginAction, registerAction, type AuthFormState } from "@/lib/actions/account";
import { Button } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";

const initialState: AuthFormState = { ok: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Phone number" name="phone" type="tel" icon={<Phone size={16} />} />
      <PasswordField label="Password" name="password" icon={<Lock size={16} />} />
      {state.error && <FormError message={state.error} />}
      <Button type="submit" variant="gold" disabled={pending} className="w-full justify-center">
        {pending ? "Signing in..." : "Sign In"}
      </Button>
      <TrustNote />
      <p className="text-center text-sm text-charcoal-500">
        New here?{" "}
        <Link href="/account/register" className="font-semibold text-forest-900 hover:text-gold-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Full name" name="name" icon={<UserIcon size={16} />} />
      <Field label="Phone number" name="phone" type="tel" icon={<Phone size={16} />} />
      <Field label="Email (optional)" name="email" type="email" required={false} icon={<Mail size={16} />} />
      <PasswordField label="Password" name="password" icon={<Lock size={16} />} />
      <PasswordField label="Confirm password" name="confirmPassword" icon={<Lock size={16} />} />
      {state.error && <FormError message={state.error} />}
      <p className="text-xs text-charcoal-500">
        Any bookings you&apos;ve already made as a guest with this phone number will
        automatically appear in your account.
      </p>
      <Button type="submit" variant="gold" disabled={pending} className="w-full justify-center">
        {pending ? "Creating account..." : "Create Account"}
      </Button>
      <TrustNote />
      <p className="text-center text-sm text-charcoal-500">
        Already have an account?{" "}
        <Link href="/account/login" className="font-semibold text-forest-900 hover:text-gold-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
  icon,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
            <MotionIcon preset="tilt">{icon}</MotionIcon>
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          className={`input-field${icon ? " pl-10" : ""}`}
        />
      </div>
    </div>
  );
}

export function PasswordField({
  label,
  name,
  required = true,
  icon,
}: {
  label: string;
  name: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
            <MotionIcon preset="tilt">{icon}</MotionIcon>
          </span>
        )}
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          className={`input-field${icon ? " pl-10" : ""} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-500 hover:text-gold-700"
        >
          <MotionIcon preset="tilt">{visible ? <EyeOff size={16} /> : <Eye size={16} />}</MotionIcon>
        </button>
      </div>
    </div>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
      <AlertCircle size={16} className="shrink-0" />
      {message}
    </p>
  );
}

function TrustNote() {
  return (
    <p className="flex items-center justify-center gap-2 text-xs text-charcoal-500">
      <ShieldBadgeIcon size={16} className="text-forest-600" />
      Your details are kept private and secure.
    </p>
  );
}
