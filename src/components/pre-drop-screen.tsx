"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { unlockVip } from "@/lib/api";
import { resolvePreDropStartsAt } from "@/lib/pre-drop";
import type { DropTheme } from "@/lib/drop-themes";
import { useTheme } from "@/lib/theme-context";
import { getThemeBadge, getThemeStartsAt } from "@/lib/theme-drop-status";
import { useT } from "@/lib/i18n";
import { ProductSlider } from "./product-slider";
import { ScreenShell } from "./screen-shell";
import { WaitlistNotifySection } from "./waitlist-notify-section";

interface PreDropScreenProps {
  startsAt: string;
  previewMode?: boolean;
  onVipUnlock: () => void;
  onTimerDone: () => void;
}

export function PreDropScreen({
  startsAt,
  previewMode = false,
  onVipUnlock,
  onTimerDone,
}: PreDropScreenProps) {
  const { t, translateError } = useT();
  const { theme, setTheme } = useTheme();
  const countdownTarget = useMemo(
    () => resolvePreDropStartsAt(startsAt, previewMode),
    [startsAt, previewMode],
  );
  const { done } = useCountdown(countdownTarget);
  const badge = getThemeBadge(theme.id);
  const badgeStartsAt = getThemeStartsAt(theme.id, startsAt, previewMode);

  const [vipOpen, setVipOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const vipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (previewMode) return;
    if (done) onTimerDone();
  }, [done, onTimerDone, previewMode]);

  const startVipPress = () => {
    vipTimer.current = setTimeout(() => setVipOpen(true), 800);
  };

  const endVipPress = () => {
    if (vipTimer.current) clearTimeout(vipTimer.current);
  };

  const submitVip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await unlockVip(password);
      setVipOpen(false);
      onVipUnlock();
    } catch (err) {
      setError(err instanceof Error ? translateError(err.message) : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell
      badgePhase={badge.phase}
      stock={badge.stock}
      totalStock={badge.totalStock}
      badgeStartsAt={badge.phase === "pre_drop" ? badgeStartsAt : undefined}
      previewPreDrop={previewMode}
      onBadgeLongPressStart={startVipPress}
      onBadgeLongPressEnd={endVipPress}
      toolbarVariant={theme.toolbarVariant}
      shareTitle={`THE4 — ${theme.name}`}
      shareText={`${theme.name} — ${theme.edition} on THE4`}
    >
      <section
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        aria-label={t("drop.productAria")}
      >
        <ProductSlider onThemeChange={(next: DropTheme) => setTheme(next)} />
      </section>

      <section
        className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        aria-label="Waitlist"
      >
        <WaitlistNotifySection />
      </section>

      {vipOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--bg)] text-[var(--fg)]">
          <header className="grid shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 border-b border-[var(--fg)]/10 px-5 py-4">
            <span aria-hidden className="block w-6" />
            <h1 className="text-center text-sm font-semibold uppercase tracking-[0.15em]">
              VIP
            </h1>
            <button
              type="button"
              onClick={() => !loading && setVipOpen(false)}
              aria-label={t("common.close")}
              className="justify-self-end text-xl leading-none text-[var(--muted)]"
            >
              ×
            </button>
          </header>

          <form
            onSubmit={submitVip}
            className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            <input
              type="password"
              autoFocus
              placeholder="VIP access"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-4 w-full border-b border-[var(--sheet-border)] bg-transparent py-3 text-center text-sm uppercase tracking-widest outline-none placeholder:text-[var(--muted)]"
            />
            {error && <p className="mt-2 text-center text-xs text-[var(--state-error)]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-auto w-full py-3 text-xs uppercase tracking-[0.25em] text-[var(--muted)]"
            >
              {loading ? "…" : "Enter"}
            </button>
          </form>
        </div>
      )}
    </ScreenShell>
  );
}
