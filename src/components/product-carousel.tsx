"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface ProductCarouselProps {
  images: readonly string[];
}

export function ProductCarousel({ images }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    dragFree: false,
  });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

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

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {images.map((src, i) => (
            <div
              key={src}
              className="flex min-w-0 flex-[0_0_100%] items-center justify-center px-6 md:px-12"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`SHIZARU OKSANA — фото ${i + 1}`}
                className="max-h-full max-w-full object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 justify-center gap-2 pb-2 pt-3">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Фото ${i + 1}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === selected
                ? "w-6 bg-[var(--fg)]"
                : "w-1.5 bg-[var(--fg)]/25 hover:bg-[var(--fg)]/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
