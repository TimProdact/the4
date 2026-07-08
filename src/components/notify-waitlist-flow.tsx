"use client";

import { useCallback, useEffect, useState } from "react";
import { joinWaitlist, isOnWaitlist } from "@/lib/api";
import { formatPhoneUz, isValidPhoneUz } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { getProfile, sendOtpMock, verifyOtpMock } from "@/lib/profile-store";

type AuthStep = "phone" | "otp";

interface NotifyWaitlistFlowProps {
  label?: string;
  subscribedLabel?: string;
  className?: string;
}

export function NotifyWaitlistFlow({
  label = "Уведомить меня",
  subscribedLabel = "Уведомим",
  className = "",
}: NotifyWaitlistFlowProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("+998 ");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const syncSubscribed = useCallback(() => {
    const user = getProfile();
    if (user?.phone && isOnWaitlist(user.phone)) {
      setSubscribed(true);
    }
  }, []);

  useEffect(() => {
    syncSubscribed();
  }, [syncSubscribed]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn(v => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const subscribeContact = async (contact: string) => {
    await joinWaitlist(contact);
    trackEvent("waitlist_join");
    setSubscribed(true);
    setAuthOpen(false);
    setError("");
  };

  const handleClick = async () => {
    if (subscribed) return;
    setError("");
    const user = getProfile();
    if (user?.phone) {
      setLoading(true);
      try {
        await subscribeContact(user.phone);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        setLoading(false);
      }
      return;
    }
    setPhone("+998 ");
    setOtp("");
    setAuthStep("phone");
    setAuthOpen(true);
  };

  const sendOtp = () => {
    setError("");
    try {
      sendOtpMock(phone);
      setResendIn(45);
      setAuthStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      verifyOtpMock(otp);
      const user = getProfile();
      if (!user?.phone) throw new Error("Не удалось войти");
      await subscribeContact(user.phone);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={subscribed || loading}
        className={className}
      >
        {loading && !authOpen ? "…" : subscribed ? subscribedLabel : label}
      </button>
      {error && !authOpen && (
        <p className="mt-2 text-center text-sm text-[var(--state-error)]">{error}</p>
      )}

      {authOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--bg)] text-[var(--fg)]">
          <header className="grid shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 border-b border-[var(--fg)]/10 px-5 py-4">
            <button
              type="button"
              onClick={() => !loading && setAuthOpen(false)}
              className="text-xs uppercase tracking-widest text-[var(--muted)]"
            >
              ←
            </button>
            <h1 className="text-center text-sm font-semibold uppercase tracking-[0.15em]">
              {authStep === "phone" ? "Вход" : "Код из SMS"}
            </h1>
            <button
              type="button"
              onClick={() => !loading && setAuthOpen(false)}
              aria-label="Закрыть"
              className="justify-self-end text-xl leading-none text-[var(--muted)]"
            >
              ×
            </button>
          </header>

          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {authStep === "phone" ? (
              <div className="mt-4 space-y-4">
                <p className="text-center text-sm text-[var(--muted)]">
                  Войдите по номеру — напишем, когда появится новость
                </p>
                <input
                  type="tel"
                  autoFocus
                  value={phone}
                  onChange={e => setPhone(formatPhoneUz(e.target.value))}
                  className="w-full border-b border-[var(--fg)]/20 bg-transparent py-3 text-lg outline-none"
                  placeholder="+998 90 123 45 67"
                />
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={!isValidPhoneUz(phone)}
                  className="w-full bg-[var(--btn)] py-3 text-sm font-semibold uppercase tracking-widest text-[var(--btn-text)] disabled:opacity-40"
                >
                  Получить код
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-center text-sm text-[var(--muted)]">Код на {phone}</p>
                <input
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full border-b border-[var(--fg)]/20 bg-transparent py-3 text-center text-2xl tracking-[0.4em] outline-none"
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={otp.length < 4 || loading}
                  className="w-full bg-[var(--btn)] py-3 text-sm font-semibold uppercase tracking-widest text-[var(--btn-text)] disabled:opacity-40"
                >
                  {loading ? "…" : "Подтвердить"}
                </button>
                <button
                  type="button"
                  disabled={resendIn > 0}
                  onClick={sendOtp}
                  className="w-full text-xs uppercase tracking-widest text-[var(--muted)] disabled:opacity-40"
                >
                  {resendIn > 0 ? `Отправить снова (${resendIn}с)` : "Отправить снова"}
                </button>
              </div>
            )}

            {error && authOpen && (
              <p className="mt-4 text-center text-sm text-[var(--state-error)]">{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
