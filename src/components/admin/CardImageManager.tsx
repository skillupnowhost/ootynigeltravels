"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronUp, ChevronDown, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MotionIcon } from "@/components/ui/MotionIcon";

export interface CardImageItem {
  id: number;
  src: string;
  alt: string;
  active: number;
  sort_order: number;
}

export type AdminActionState = { ok: boolean; error?: string };

interface CardImageManagerProps {
  parentId: number;
  parentIdField: string;
  images: CardImageItem[];
  maxImages?: number;
  uploadAction: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  updateAction: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  deleteAction: (formData: FormData) => Promise<void>;
  reorderAction: (formData: FormData) => Promise<void>;
}

export function CardImageManager({
  parentId,
  parentIdField,
  images,
  maxImages = 5,
  uploadAction,
  updateAction,
  deleteAction,
  reorderAction,
}: CardImageManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initialUploadState: AdminActionState = { ok: false };
  const [uploadState, uploadFormAction, uploadPending] = useActionState(uploadAction, initialUploadState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (uploadState.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [uploadState, router]);

  function move(index: number, dir: -1 | 1) {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const fd = new FormData();
    fd.set(parentIdField, String(parentId));
    fd.set("ordered_ids", next.map((i) => i.id).join(","));
    startTransition(async () => {
      await reorderAction(fd);
      router.refresh();
    });
  }

  function remove(id: number) {
    if (!confirm("Delete this photo?")) return;
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(async () => {
      await deleteAction(fd);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-forest-950">
          Card photos ({images.length}/{maxImages})
        </h3>
      </div>

      {images.length === 0 && (
        <p className="mt-3 text-sm text-charcoal-500">No photos yet — this card will show a placeholder on the site.</p>
      )}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, index) => (
          <li key={img.id} className="overflow-hidden rounded-xl border border-forest-100">
            <div className="relative h-36 w-full bg-forest-50">
              <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="240px" />
              {img.active === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-ivory-100/90 px-2 py-0.5 text-[10px] font-semibold text-charcoal-600">
                  Hidden
                </span>
              )}
            </div>
            <ImageEditRow image={img} updateAction={updateAction} />
            <div className="flex items-center justify-between border-t border-forest-50 px-2 py-1.5">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || isPending}
                  className="rounded-lg p-1.5 text-forest-700 transition-colors hover:bg-forest-50 disabled:opacity-30"
                  aria-label="Move earlier"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1 || isPending}
                  className="rounded-lg p-1.5 text-forest-700 transition-colors hover:bg-forest-50 disabled:opacity-30"
                  aria-label="Move later"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(img.id)}
                disabled={isPending}
                className="rounded-lg p-1.5 text-charcoal-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Delete photo"
              >
                <MotionIcon preset="wiggle">
                  <Trash2 size={16} />
                </MotionIcon>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {images.length < maxImages ? (
        <form ref={formRef} action={uploadFormAction} className="mt-5 flex flex-wrap items-end gap-3 border-t border-forest-100 pt-5">
          <input type="hidden" name={parentIdField} value={parentId} />
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Upload photo</label>
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-forest-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-forest-800"
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-sm font-medium text-forest-900">Alt text (optional)</label>
            <input type="text" name="alt" placeholder="Describe the photo" className="input-field" />
          </div>
          <Button type="submit" variant="forest" icon={false} disabled={uploadPending} className="px-5 py-2.5">
            {uploadPending ? "Uploading..." : "Upload"}
          </Button>
        </form>
      ) : (
        <p className="mt-5 border-t border-forest-100 pt-5 text-sm text-charcoal-500">
          Maximum of {maxImages} photos reached — delete one to add another.
        </p>
      )}
      {uploadState.error && (
        <p className="mt-3 animate-pop-in rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{uploadState.error}</p>
      )}
    </div>
  );
}

function ImageEditRow({
  image,
  updateAction,
}: {
  image: CardImageItem;
  updateAction: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const initial: AdminActionState = { ok: false };
  const [state, formAction, pending] = useActionState(updateAction, initial);

  // Close the edit row once the save succeeds — adjusted during render (per
  // React's "you might not need an effect" guidance) rather than in a useEffect.
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state.ok) setEditing(false);
  }

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-charcoal-600 transition-colors hover:bg-forest-50"
      >
        <Pencil size={12} className="shrink-0 text-forest-500" />
        <span className="truncate">{image.alt}</span>
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2 px-3 py-2">
      <input type="hidden" name="id" value={image.id} />
      <input
        type="text"
        name="alt"
        defaultValue={image.alt}
        required
        className="input-field-subtle input-field !py-1.5 text-xs"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-forest-900">
          <input type="checkbox" name="active" defaultChecked={image.active === 1} className="h-3.5 w-3.5 accent-forest-700" />
          Visible
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg p-1 text-charcoal-500 hover:bg-ivory-100"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg p-1 text-forest-700 hover:bg-forest-100 disabled:opacity-50"
            aria-label="Save"
          >
            <Check size={14} />
          </button>
        </div>
      </div>
      {state.error && <p className="text-[11px] text-red-600">{state.error}</p>}
    </form>
  );
}
