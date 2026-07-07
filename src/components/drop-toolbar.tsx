"use client";

import Link from "next/link";
import { useState } from "react";

interface DropToolbarProps {
  variant?: "light" | "dark";
  stock?: number;
  totalStock?: number;
  soldOut?: boolean;
  shareTitle?: string;
  shareText?: string;
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5v7.25A2.25 2.25 0 0 0 8.25 20h7.5A2.25 2.25 0 0 0 18 17.75V10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m6 12.5 3.5 3.5L18 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DropToolbar({
  variant = "light",
  stock,
  totalStock,
  soldOut = false,
  shareTitle = "THE4",
  shareText = "Limited drop on THE4",
}: DropToolbarProps) {
  const [shared, setShared] = useState(false);
  const dark = variant === "dark";
  const showStock = stock !== undefined && totalStock !== undefined;

  const circleClass = dark
    ? "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition active:scale-95"
    : "flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[var(--bg)] text-[var(--fg)] transition active:scale-95";

  const handleShare = async () => {
    const url = window.location.href;
    const payload = {
      title: shareTitle,
      text: shareText,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        /* cancelled */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      window.prompt("Copy link:", url);
    }
  };

  return (
    <header className="grid shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 px-5 py-4 md:px-6 md:py-5">
      <Link href="/home" aria-label="На главную" className={`${circleClass} justify-self-start`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/monkey-logo.png"
          alt=""
          draggable={false}
          className={`h-9 w-9 select-none object-contain ${dark ? "invert" : ""}`}
        />
      </Link>

      {showStock ? (
        <p
          className={`text-center text-xs font-medium tracking-wide ${
            dark
              ? soldOut
                ? "text-white/50"
                : "text-red-400"
              : soldOut
                ? "text-[var(--muted)]"
                : "text-[var(--accent)]"
          }`}
          style={
            dark || soldOut
              ? undefined
              : { textShadow: "0 0 20px rgba(255,45,45,0.35)" }
          }
        >
          {soldOut ? "SOLD OUT" : `Осталось: ${stock} / ${totalStock}`}
        </p>
      ) : (
        <span aria-hidden />
      )}

      <button
        type="button"
        onClick={handleShare}
        aria-label={shared ? "Ссылка скопирована" : "Поделиться"}
        className={`${circleClass} justify-self-end`}
      >
        {shared ? <CheckIcon /> : <ShareIcon />}
      </button>
    </header>
  );
}
