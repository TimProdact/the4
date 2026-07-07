"use client";

import { Logo } from "./logo";
import { ProductCarousel } from "./product-carousel";

interface SoldOutScreenProps {
  images: readonly string[];
}

export function SoldOutScreen({ images }: SoldOutScreenProps) {
  return (
    <main className="relative grid h-[100dvh] grid-rows-[10fr_65fr_25fr] overflow-hidden bg-[#b8b8b8]">
      <header className="min-h-0 shrink-0">
        <Logo />
      </header>

      <section className="relative min-h-0 overflow-hidden grayscale">
        <ProductCarousel images={images} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="border-4 border-white px-6 py-3 text-2xl font-bold uppercase tracking-[0.35em] text-white md:text-3xl">
            Sold Out
          </span>
        </div>
      </section>

      <section className="flex min-h-0 items-center justify-center px-6 pb-[env(safe-area-inset-bottom)]">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          Edition closed
        </p>
      </section>
    </main>
  );
}
