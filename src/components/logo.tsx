"use client";

import { useRef, useState } from "react";

interface LogoProps {
  variant?: "light" | "dark";
  onLongPress?: () => void;
}

export function Logo({ variant = "dark", onLongPress }: LogoProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

  const color = variant === "light" ? "text-white" : "text-[var(--fg)]";

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

  return (
    <div className="flex h-full items-center justify-center">
      <span
        role="img"
        aria-label="The4"
        onPointerDown={start}
        onPointerUp={end}
        onPointerLeave={end}
        onContextMenu={e => e.preventDefault()}
        className={`select-none text-[1.35rem] font-semibold tracking-[0.35em] md:text-[1.5rem] ${color} ${
          pressing ? "opacity-60" : ""
        } ${onLongPress ? "cursor-default touch-none" : ""}`}
      >
        THE4
      </span>
    </div>
  );
}
