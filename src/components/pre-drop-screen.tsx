"use client";

import { useEffect } from "react";
import { useState } from "react";
import { Logo } from "./logo";
import { useCountdown } from "@/hooks/use-countdown";
import { unlockVip } from "@/lib/api";

interface PreDropScreenProps {
  startsAt: string;
  onVipUnlock: () => void;
  onTimerDone: () => void;
}

export function PreDropScreen({ startsAt, onVipUnlock, onTimerDone }: PreDropScreenProps) {
  const { h, m, s, done } = useCountdown(startsAt);
  const [vipOpen, setVipOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (done) onTimerDone();
  }, [done, onTimerDone]);

  const submitVip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await unlockVip(password);
      setVipOpen(false);
      onVipUnlock();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid h-[100dvh] grid-rows-[1fr_auto] bg-black text-white">
      <div className="flex flex-col items-center justify-center px-6">
        <Logo variant="light" onLongPress={() => setVipOpen(true)} />

        <p
          className="mt-16 font-mono text-4xl font-light tracking-[0.15em] tabular-nums md:text-5xl"
          aria-live="polite"
        >
          {h} : {m} : {s}
        </p>
      </div>

      {vipOpen && (
        <form
          onSubmit={submitVip}
          className="border-t border-white/10 px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <input
            type="password"
            autoFocus
            placeholder="VIP access"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border-b border-white/30 bg-transparent py-3 text-center text-sm uppercase tracking-widest outline-none placeholder:text-white/30"
          />
          {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 text-xs uppercase tracking-[0.25em] text-white/70"
          >
            {loading ? "…" : "Enter"}
          </button>
        </form>
      )}
    </main>
  );
}
