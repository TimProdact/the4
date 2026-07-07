"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { subscribeDrop } from "@/lib/client-store";

export function useDropStream(initial: DropSnapshot) {
  const [snap, setSnap] = useState(initial);

  useEffect(() => subscribeDrop(setSnap), []);

  return snap;
}
