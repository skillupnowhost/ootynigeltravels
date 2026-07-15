"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "onl_wishlist_v1";
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedList: string[] = [];

function readWishlist(): string[] {
  if (typeof window === "undefined") return cachedList;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedList = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      cachedList = [];
    }
  }
  return cachedList;
}

function writeWishlist(slugs: string[]): void {
  cachedRaw = JSON.stringify(slugs);
  cachedList = slugs;
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  listeners.forEach((notify) => notify());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

const EMPTY_SNAPSHOT: string[] = [];

function getServerSnapshot(): string[] {
  return EMPTY_SNAPSHOT;
}

/** Guest-first wishlist: persisted to localStorage only, no account required. */
export function useWishlist(slug: string) {
  const list = useSyncExternalStore(subscribe, readWishlist, getServerSnapshot);
  const saved = list.includes(slug);

  const toggle = useCallback(() => {
    const current = readWishlist();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    writeWishlist(next);
  }, [slug]);

  return { saved, toggle };
}
