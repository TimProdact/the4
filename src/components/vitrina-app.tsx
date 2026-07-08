"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { DropApp } from "@/components/drop-app";
import { StorefrontScreen } from "@/components/storefront-screen";
import { fetchRemoteDrop, readDropIdFromLocation } from "@/lib/remote-drop-api";

export function VitrinaApp({ initial }: { initial: DropSnapshot }) {
  const [dropId, setDropId] = useState<string | null>(null);
  const [dropInitial, setDropInitial] = useState<DropSnapshot>(initial);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const id = readDropIdFromLocation();
    setDropId(id);
    if (id) {
      fetchRemoteDrop(false, id).then((remote) => {
        if (remote) setDropInitial(remote);
        setBooted(true);
      });
    } else {
      setBooted(true);
    }
  }, []);

  const openDrop = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("drop", id);
    window.history.pushState({}, "", url);
    setDropId(id);
    fetchRemoteDrop(false, id).then((remote) => {
      if (remote) setDropInitial(remote);
    });
  };

  const backToStorefront = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("drop");
    window.history.pushState({}, "", url);
    setDropId(null);
  };

  useEffect(() => {
    const onPop = () => setDropId(readDropIdFromLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (!booted) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-[#0d1117] text-[#ffe8ef]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </main>
    );
  }

  if (dropId) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={backToStorefront}
          className="fixed left-3 top-[calc(8px+env(safe-area-inset-top))] z-50 rounded-full bg-black/45 px-3 py-1.5 text-sm text-white backdrop-blur"
        >
          ← Витрина
        </button>
        <DropApp initial={dropInitial} dropId={dropId} />
      </div>
    );
  }

  return <StorefrontScreen onOpenDrop={openDrop} />;
}
