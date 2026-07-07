"use client";

import { DropToolbar } from "./drop-toolbar";

export function PausedScreen() {
  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-black text-white">
      <div className="px-5 py-4 md:px-6 md:py-5">
        <DropToolbar variant="dark" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">The4</p>
        <h1 className="mt-6 text-center text-2xl font-semibold uppercase tracking-[0.15em]">
          Drop Paused
        </h1>
        <p className="mt-4 max-w-xs text-center text-sm text-white/60">
          Дроп временно приостановлен. Вернись позже.
        </p>
      </div>
    </main>
  );
}
