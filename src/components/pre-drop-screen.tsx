"use client";

import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useCountdown } from "@/hooks/use-countdown";
import { joinWaitlist, unlockVip } from "@/lib/api";
import { DropToolbar } from "./drop-toolbar";

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
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

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

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await joinWaitlist(contact);
      setWaitlistDone(true);
      setWaitlistOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid h-[100dvh] grid-rows-[auto_1fr_auto] bg-black text-white">
      <DropToolbar variant="dark" />

      <div className="flex flex-col items-center justify-center px-6">
        <Logo variant="light" onLongPress={() => setVipOpen(true)} />

        <p
          className="mt-16 font-mono text-4xl font-light tracking-[0.15em] tabular-nums md:text-5xl"
          aria-live="polite"
        >
          {h} : {m} : {s}
        </p>

        <p className="mt-8 text-center text-sm text-white/50">Дроп скоро откроется</p>

        {waitlistDone ? (
          <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-emerald-400">
            Ты в waitlist — напишем перед стартом
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setWaitlistOpen(true)}
            className="mt-6 text-xs uppercase tracking-[0.25em] text-white/70 underline underline-offset-4"
          >
            Уведомить меня
          </button>
        )}
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

      {waitlistOpen && (
        <form
          onSubmit={submitWaitlist}
          className="border-t border-white/10 px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <input
            type="text"
            autoFocus
            placeholder="Телефон или email"
            value={contact}
            onChange={e => setContact(e.target.value)}
            className="w-full border-b border-white/30 bg-transparent py-3 text-center text-sm outline-none placeholder:text-white/30"
          />
          {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3 text-xs uppercase tracking-[0.25em] text-white/70"
          >
            {loading ? "…" : "В waitlist"}
          </button>
        </form>
      )}
    </main>
  );
}
