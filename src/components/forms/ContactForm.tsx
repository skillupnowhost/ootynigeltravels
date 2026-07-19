"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { submitContactMessage, type ContactFormState } from "@/lib/actions/public";
import { Button } from "@/components/ui/Button";
import { CalendarCheckIcon } from "@/components/ui/AnimatedIcons";

const initialState: ContactFormState = { ok: false };

const ease = [0.22, 1, 0.36, 1] as const;

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  if (state.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-forest-100 bg-forest-50 p-10 text-center"
      >
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-forest-900 text-gold-400"
        >
          <CalendarCheckIcon size={30} loop={false} />
        </motion.span>
        <p className="font-display text-lg text-forest-950">Message sent</p>
        <p className="text-sm text-charcoal-500">
          Thank you — our team will get back to you shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" required />
        <Field label="Phone" name="phone" type="tel" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" />
        <Field label="Subject" name="subject" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          className="w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none transition-colors focus:border-gold-500"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-forest-900" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none transition-colors focus:border-gold-500"
      />
    </div>
  );
}
