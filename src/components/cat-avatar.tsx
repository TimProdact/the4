"use client";

import { useState } from "react";
import { getCatAvatar } from "@/lib/cat-avatars";

const SIZES = {
  sm: "h-11 w-11",
  md: "h-16 w-16",
  lg: "h-24 w-24",
} as const;

interface CatAvatarProps {
  avatarId?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
  /** Guest / unknown: question mark instead of photo */
  unknown?: boolean;
}

function UnknownMark({
  size,
  className,
}: {
  size: keyof typeof SIZES;
  className: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--fg)]/20 bg-[var(--fg)]/5 font-semibold text-[var(--muted)] ${
        size === "sm" ? "text-base" : size === "lg" ? "text-4xl" : "text-2xl"
      } ${SIZES[size]} ${className}`}
    >
      ?
    </span>
  );
}

export function CatAvatar({
  avatarId,
  size = "md",
  className = "",
  unknown = false,
}: CatAvatarProps) {
  const [failed, setFailed] = useState(false);
  const cat = getCatAvatar(avatarId);

  if (unknown || failed) {
    return <UnknownMark size={size} className={className} />;
  }

  return (
    <img
      key={cat.src}
      src={cat.src}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover ${SIZES[size]} ${className}`}
    />
  );
}

/** @deprecated use CatAvatar */
export const MonkeyAvatar = CatAvatar;
