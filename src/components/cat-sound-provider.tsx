"use client";

import { useEffect } from "react";
import {
  loadCatSoundsPreference,
  playCatMeow,
  primeCatSounds,
} from "@/lib/cat-sounds";

const ACTION_SELECTOR = [
  "button",
  "a[href]",
  '[role="button"]',
  'input[type="submit"]',
  'input[type="button"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  "summary",
  '[role="tab"]',
  '[role="menuitem"]',
].join(", ");

function isActionClick(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;

  const el = target.closest(ACTION_SELECTOR);
  if (!el) return false;
  if (el.closest("[data-silent]")) return false;
  if (el instanceof HTMLButtonElement && el.disabled) return false;
  if (el instanceof HTMLInputElement && el.disabled) return false;
  if (el.getAttribute("aria-disabled") === "true") return false;

  return true;
}

export function CatSoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadCatSoundsPreference();
    primeCatSounds();

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (!isActionClick(event.target)) return;
      playCatMeow();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return children;
}
