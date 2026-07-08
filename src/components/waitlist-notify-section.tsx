"use client";

import { useCallback, useEffect, useState } from "react";
import { isOnWaitlist, joinWaitlist } from "@/lib/api";
import { formatPhoneUz, isValidPhoneUz } from "@/lib/format";
import { useT } from "@/lib/i18n";
import {
  getProfile,
  sendOtpMock,
  verifyOtpMock,
} from "@/lib/profile-store";

type AuthStep = "phone" | "otp";

const notifyBtnBase =
  "w-full py-4 text-sm font-semibold uppercase tracking-[0.28em] transition active:scale-[0.99] md:py-5";

interface WaitlistNotifySectionProps {
  hint?: string;
}

export function WaitlistNotifySection({ hint }: WaitlistNotifySectionProps) {
  const { t, translateError } = useT();
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
    const timer = window.setTimeout(() => setResendIn(v => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const subscribeContact = async (contact: string) => {
    await joinWaitlist(contact);
    setSubscribed(true);
    setAuthOpen(false);
    setError("");
  };

  const handleNotifyClick = async () => {
    if (subscribed) return;
    setError("");
    const user = getProfile();
    if (user?.phone) {
      setLoading(true);
      try {
        await subscribeContact(user.phone);
      } catch (err) {
        setError(err instanceof Error ? translateError(err.message) : t("common.error"));
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
      setError(e instanceof Error ? translateError(e.message) : t("common.error"));
    }
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      verifyOtpMock(otp);
      const user = getProfile();
      if (!user?.phone) throw new Error("waitlist.loginFailed");
      await subscribeContact(user.phone);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("common.error");
      setError(msg.startsWith("waitlist.") ? t(msg) : translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {hint && (
        <p className="mb-3 text-center text-xs text-[var(--muted)]">{hint}</p>
      )}
      {error && !authOpen && (
        <p className="mb-3 text-center text-xs text-[var(--state-error)]">{error}</p>
      )}
      <button
        type="button"
        onClick={handleNotifyClick}
        disabled={subscribed || loading}
        aria-pressed={subscribed}
        className={
          subscribed
            ? `${notifyBtnBase} border-2 border-[var(--btn)] bg-[var(--btn)]/15 text-[var(--btn)] ring-2 ring-inset ring-[var(--btn)]/40`
            : `${notifyBtnBase} bg-[var(--btn)] text-[var(--btn-text)] disabled:opacity-60`
        }
      >
        {loading && !authOpen ? t("common.loading") : subscribed ? t("waitlist.notified") : t("waitlist.notify")}
      </button>

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
              {authStep === "phone" ? t("waitlist.authTitlePhone") : t("waitlist.authTitleOtp")}
            </h1>
            <button
              type="button"
              onClick={() => !loading && setAuthOpen(false)}
              aria-label={t("common.close")}
              className="justify-self-end text-xl leading-none text-[var(--muted)]"
            >
              ×
            </button>
          </header>

          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {authStep === "phone" ? (
              <div className="mt-4 space-y-4">
                <p className="text-center text-sm text-[var(--muted)]">
                  {t("waitlist.authHint")}
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
                  {t("waitlist.getCode")}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-center text-sm text-[var(--muted)]">
                  {t("waitlist.codeSentTo", { phone })}
                </p>
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
                  {loading ? t("common.loading") : t("waitlist.confirm")}
                </button>
                <button
                  type="button"
                  disabled={resendIn > 0}
                  onClick={sendOtp}
                  className="w-full text-xs uppercase tracking-widest text-[var(--muted)] disabled:opacity-40"
                >
                  {resendIn > 0
                    ? t("waitlist.resendIn", { seconds: resendIn })
                    : t("waitlist.resend")}
                </button>
              </div>
            )}

            {error && (
              <p className="mt-4 text-center text-sm text-[var(--state-error)]">{error}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
