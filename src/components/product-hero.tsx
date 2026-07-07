"use client";

import { formatPrice } from "@/lib/format";
import { SkullViewer } from "./skull-viewer";

interface ProductHeroProps {
  name: string;
  edition: string;
  price: number;
}

export function ProductHero({ name, edition, price }: ProductHeroProps) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center px-4">
      <div className="h-[min(58dvh,28rem)] w-full shrink-0 overflow-hidden sm:h-[min(62dvh,30rem)]">
        <SkullViewer />
      </div>

      <p className="mt-4 shrink-0 text-center text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
        {name}
        <span className="mx-1.5 text-[var(--fg)]/20">—</span>
        {edition}
      </p>

      <p className="mt-1.5 shrink-0 text-center text-base font-medium tracking-wide text-[var(--fg)]">
        {formatPrice(price)}
      </p>
    </div>
  );
}
