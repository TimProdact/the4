"use client";

import { useRef, useState } from "react";

interface LogoProps {
  variant?: "light" | "dark";
  onLongPress?: () => void;
}

export function Logo({ variant = "dark", onLongPress }: LogoProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

  const start = () => {
    if (!onLongPress) return;
    setPressing(true);
    timer.current = setTimeout(() => {
      onLongPress();
      setPressing(false);
    }, 800);
  };

  const end = () => {
    if (timer.current) clearTimeout(timer.current);
    setPressing(false);
  };

  const src =
    variant === "light" ? "/the4-logo-white.png" : "/the4-logo-black.png";

  return (
    <div className="flex items-center justify-center py-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="The4"
        draggable={false}
        onPointerDown={start}
        onPointerUp={end}
        onPointerLeave={end}
        onContextMenu={e => e.preventDefault()}
        className={`h-5 w-auto select-none md:h-6 ${
          pressing ? "opacity-60" : ""
        } ${onLongPress ? "cursor-default touch-none" : ""}`}
      />
    </div>
  );
}
