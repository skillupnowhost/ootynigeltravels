"use client";

import { useActionState } from "react";
import { adminLoginAction, type AuthFormState } from "@/lib/actions/adminAuth";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldBadgeIcon } from "@/components/ui/AnimatedIcons";

const initialState: AuthFormState = { ok: false };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-950 px-6">
      <Reveal className="w-full max-w-sm">
        <div className="rounded-3xl border border-forest-800 bg-forest-900 p-8">
          <ShieldBadgeIcon size={30} className="text-gold-400" loop={false} />
          <h1 className="mt-4 font-display text-2xl text-ivory-50">Admin Sign In</h1>
          <p className="mt-1 text-sm text-forest-300">Ooty Nigel Travels — staff access</p>

          <form action={formAction} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-200" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="w-full rounded-xl border border-forest-700 bg-forest-950 px-4 py-3 text-sm text-ivory-50 outline-none transition-colors duration-200 focus:border-gold-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest-200" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-forest-700 bg-forest-950 px-4 py-3 text-sm text-ivory-50 outline-none transition-colors duration-200 focus:border-gold-500"
              />
            </div>
            {state.error && (
              <p className="animate-pop-in rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-gold-600 px-5 py-3 text-sm font-semibold text-forest-950 transition-all duration-300 hover:bg-gold-500 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  );
}
