"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { updateAvatarAction, type AuthFormState } from "@/lib/actions/account";
import { MotionIcon } from "@/components/ui/MotionIcon";

const initial: AuthFormState = { ok: false };

export function AvatarUploader({ name, avatar }: { name: string; avatar: string | null }) {
  const [state, formAction, pending] = useActionState(updateAvatarAction, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form ref={formRef} action={formAction}>
      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={() => formRef.current?.requestSubmit()}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        aria-label="Change profile picture"
        className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-forest-900 text-base font-semibold text-gold-400 disabled:opacity-70"
      >
        {avatar ? (
          <Image src={avatar} alt={name} fill sizes="48px" className="object-cover" />
        ) : (
          name.slice(0, 1).toUpperCase()
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-forest-950/60 opacity-0 transition-opacity group-hover:opacity-100">
          <MotionIcon preset="pop">
            <Camera size={16} className="text-ivory-50" />
          </MotionIcon>
        </span>
      </button>
      {state.error && <p className="mt-2 max-w-[10rem] text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
