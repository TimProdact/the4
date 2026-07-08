"use client";

import { useEffect, useState } from "react";
import type { StorefrontSnapshot } from "@/lib/types";
import { fetchRemoteStorefront } from "@/lib/remote-drop-api";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X",
  website: "Сайт",
};

function phaseLabel(phase: string, paused?: boolean) {
  if (paused) return "Пауза";
  if (phase === "active") return "Идёт продажа";
  if (phase === "sold_out") return "Распродано";
  return "Скоро";
}

function formatPrice(n: number, currency = "UZS") {
  return `${Number(n).toLocaleString("ru-RU")} ${currency}`;
}

export function StorefrontScreen({ onOpenDrop }: { onOpenDrop: (dropId: string) => void }) {
  const [data, setData] = useState<StorefrontSnapshot | null>(null);

  useEffect(() => {
    fetchRemoteStorefront().then(setData);
  }, []);

  if (!data) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#0d1117] text-white/70">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </main>
    );
  }

  const { storefront, drops } = data;
  const avatar = storefront.avatarUrl || "";

  return (
    <main className="min-h-[100dvh] bg-[#0d1117] text-white">
      <div className="mx-auto max-w-md px-4 pb-10 pt-[calc(16px+env(safe-area-inset-top))]">
        <header className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/10 text-4xl shadow-lg">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{storefront.logoEmoji || "🐱"}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{storefront.displayName}</h1>
          {storefront.bio ? (
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/65">{storefront.bio}</p>
          ) : null}

          {storefront.socialLinks?.length ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {storefront.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-sky-300"
                >
                  {SOCIAL_LABELS[link.platform] || link.platform}
                </a>
              ))}
            </div>
          ) : null}
        </header>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/45">Дропы</h2>
          <div className="grid gap-3">
            {drops.map((drop) => {
              const image = drop.images?.[0];
              return (
                <button
                  key={drop.id}
                  type="button"
                  onClick={() => onOpenDrop(drop.id)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] p-3 text-left transition active:scale-[0.98]"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">🧴</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{drop.name}</div>
                    <div className="truncate text-sm text-white/55">{drop.edition}</div>
                    <div className="mt-1 text-sm font-medium text-sky-300">
                      {phaseLabel(drop.phase, drop.paused)} · {formatPrice(drop.price, drop.currency)}
                    </div>
                  </div>
                </button>
              );
            })}
            {!drops.length ? (
              <p className="rounded-2xl bg-white/[0.04] p-6 text-center text-white/50">Дропов пока нет</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
