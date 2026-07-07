"use client";

import dynamic from "next/dynamic";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { DROP_THEMES, applyTheme, type DropTheme } from "@/lib/drop-themes";
import { formatPrice } from "@/lib/format";
import { ErrorBoundary } from "./error-boundary";

const GlbViewer = dynamic(() => import("./glb-viewer").then(m => m.GlbViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--fg)]/15 border-t-[var(--fg)]" />
    </div>
  ),
});

interface ProductSliderProps {
  onThemeChange?: (theme: DropTheme) => void;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProductSlider({ onThemeChange }: ProductSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", duration: 28 });
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setActiveIndex(idx);
    const theme = DROP_THEMES[idx];
    applyTheme(theme);
    onThemeChange?.(theme);
  }, [emblaApi, onThemeChange]);

  useEffect(() => {
    applyTheme(DROP_THEMES[0]);
    onThemeChange?.(DROP_THEMES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const theme = DROP_THEMES[activeIndex];

  return (
    <div className="flex w-full max-w-xl flex-col items-center px-2">
      <div className="relative h-[min(52dvh,26rem)] w-full shrink-0 sm:h-[min(56dvh,28rem)]">
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Предыдущий"
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--fg)]/10 bg-[var(--bg)]/80 text-[var(--fg)] backdrop-blur-sm transition active:scale-95"
        >
          <Chevron dir="left" />
        </button>

        <button
          type="button"
          onClick={scrollNext}
          aria-label="Следующий"
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--fg)]/10 bg-[var(--bg)]/80 text-[var(--fg)] backdrop-blur-sm transition active:scale-95"
        >
          <Chevron dir="right" />
        </button>

        <div className="h-full overflow-hidden px-10" ref={emblaRef}>
          <div className="flex h-full">
            {DROP_THEMES.map((t, i) => (
              <div key={t.id} className="h-full min-w-0 shrink-0 grow-0 basis-full">
                <ErrorBoundary>
                  <GlbViewer theme={t} active={i === activeIndex} />
                </ErrorBoundary>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        {DROP_THEMES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            aria-label={t.name}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-[var(--fg)]/20"
            }`}
          />
        ))}
      </div>

      <p className="mt-4 shrink-0 text-center text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)] transition-colors duration-300">
        {theme.name}
        <span className="mx-1.5 text-[var(--fg)]/20">—</span>
        {theme.edition}
      </p>

      <p className="mt-1.5 shrink-0 text-center text-base font-medium tracking-wide text-[var(--fg)] transition-colors duration-300">
        {formatPrice(theme.price)}
      </p>

      <p className="mt-1 shrink-0 text-center text-[0.65rem] uppercase tracking-[0.18em] text-[var(--accent)] transition-colors duration-300">
        {theme.tagline}
      </p>
    </div>
  );
}
