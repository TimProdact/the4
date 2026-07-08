"use client";

import { useEffect, useMemo, useState } from "react";
import type { CheckoutResult, DropSnapshot } from "@/lib/api";
import {
  completeCheckout,
  createHold,
  DROP_CONFIG,
  releaseHold,
} from "@/lib/api";
import { asset } from "@/lib/asset";
import { formatPhoneUz, formatPrice, isValidPhoneUz } from "@/lib/format";
import { useHoldCountdown } from "@/hooks/use-hold-countdown";
import { getCheckoutPrefill } from "./profile-sheet";
import { StatePanel } from "./state-panel";
import type { CheckoutPreview } from "@/lib/preview";
import { trackEvent } from "@/lib/analytics";
import { useProfile } from "@/lib/profile-context";
import { useT } from "@/lib/i18n";

type Step =
  | "summary"
  | "identity"
  | "delivery"
  | "payment"
  | "processing"
  | "pending"
  | "hold_expired"
  | "race_lost"
  | "payment_failed";

const STEP_TITLE_KEY: Record<Step, string> = {
  summary: "checkout.summary",
  identity: "checkout.identity",
  delivery: "checkout.delivery",
  payment: "checkout.payment",
  processing: "checkout.processing",
  pending: "checkout.pending",
  hold_expired: "checkout.holdExpired",
  race_lost: "checkout.raceLost",
  payment_failed: "checkout.paymentFailed",
};

interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  snap: DropSnapshot;
  themeId?: string;
  prefill?: { name?: string; phone?: string };
  offline?: boolean;
  initialStep?: CheckoutPreview;
  previewFailedOrderId?: number;
}

export function CheckoutSheet({
  open,
  onClose,
  snap,
  themeId,
  prefill,
  offline,
  initialStep,
  previewFailedOrderId,
}: CheckoutSheetProps) {
  const { openProfileOrder } = useProfile();
  const { t, locale, translateError } = useT();
  const [step, setStep] = useState<Step>((initialStep as Step) ?? "summary");
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [name, setName] = useState(prefill?.name || "");
  const [phone, setPhone] = useState(prefill?.phone ? formatPhoneUz(prefill.phone) : "+998 ");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedOrderId, setFailedOrderId] = useState<number | null>(null);
  const [acceptedOffer, setAcceptedOffer] = useState(false);

  const { expired, label: holdLabel } = useHoldCountdown(holdExpiresAt);
  const stepTitle = useMemo(() => t(STEP_TITLE_KEY[step]), [step, t]);

  useEffect(() => {
    if (!open) return;
    trackEvent("checkout_open");
    setStep(initialStep ?? "summary");
    setError("");
    setHoldId(initialStep && initialStep !== "summary" ? "preview-hold" : null);
    setHoldExpiresAt(
      initialStep && !["summary", "hold_expired", "race_lost", "payment_failed"].includes(initialStep)
        ? Date.now() + 5 * 60_000
        : null,
    );
    setFailedOrderId(previewFailedOrderId ?? null);
    if (prefill?.name) setName(prefill.name);
    if (prefill?.phone) setPhone(formatPhoneUz(prefill.phone));
    const profileFill = getCheckoutPrefill();
    if (!prefill?.name && profileFill.name) setName(profileFill.name);
    if (!prefill?.phone && profileFill.phone) setPhone(formatPhoneUz(profileFill.phone));
    if (profileFill.address) setAddress(profileFill.address);
  }, [open, prefill?.name, prefill?.phone, initialStep, previewFailedOrderId]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [open]);

  useEffect(() => {
    if (!holdExpiresAt || step === "hold_expired" || step === "summary") return;
    if (expired) setStep("hold_expired");
  }, [expired, holdExpiresAt, step]);

  if (!open) return null;

  const closeSheet = async () => {
    if (holdId) await releaseHold(holdId).catch(() => {});
    onClose();
  };

  const finishSuccess = (result: CheckoutResult) => {
    trackEvent("checkout_paid");
    onClose();
    openProfileOrder(result.orderId);
  };

  const startHold = async () => {
    if (offline) {
      setError(t("checkout.offline"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await createHold(themeId);
      setHoldId(data.holdId);
      setHoldExpiresAt(data.expiresAt);
      trackEvent("checkout_hold");
      setStep("identity");
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "ALL_HELD") {
        setError(t("checkout.allHeld"));
      } else if (err.code === "SOLD_OUT" || err.code === "RACE_LOST") {
        setStep("race_lost");
      } else if (err.code === "PAUSED") {
        setError(t("checkout.paused"));
      } else {
        setError(translateError(err.message || t("common.error")));
      }
    } finally {
      setLoading(false);
    }
  };

  const pay = async (paymentMethod: "paylov" | "apple" | "google") => {
    if (!holdId || offline) return;
    if (!acceptedOffer) {
      setError(t("checkout.acceptOfferError"));
      return;
    }
    if (!name.trim() || !isValidPhoneUz(phone)) {
      setError(t("checkout.fillNamePhone"));
      setStep("identity");
      return;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      setError(t("checkout.enterAddress"));
      setStep("delivery");
      return;
    }

    setStep("processing");
    setError("");
    try {
      const result = await completeCheckout({
        holdId,
        holdExpiresAt: holdExpiresAt ?? undefined,
        name: name.trim(),
        phone,
        deliveryType,
        address: deliveryType === "pickup" ? DROP_CONFIG.pickupAddress : address.trim(),
        paymentMethod,
        productName: snap.name,
        edition: snap.edition,
        amount: snap.price,
        themeId,
      });

      if (result.status === "pending") {
        setStep("pending");
        window.setTimeout(() => finishSuccess({ ...result, status: "paid" }), 2500);
        return;
      }
      finishSuccess(result);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "HOLD_EXPIRED") {
        trackEvent("hold_expired");
        setStep("hold_expired");
        return;
      }
      if (err.code === "RACE_LOST" || err.code === "SOLD_OUT") {
        trackEvent("race_lost");
        setStep("race_lost");
        return;
      }
      if (err.code === "PAYMENT_FAILED") {
        trackEvent("checkout_failed");
        setFailedOrderId((err as Error & { orderId?: number }).orderId ?? null);
        setStep("payment_failed");
        return;
      }
      setError(translateError(err.message || t("checkout.paymentError")));
      setStep("payment");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--sheet-bg)] text-[var(--sheet-fg)]">
      <header className="grid shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 border-b border-[var(--sheet-border)] px-5 py-4">
        <span aria-hidden className="block w-6" />
        <h1 className="text-center text-sm font-semibold uppercase tracking-[0.15em]">
          {stepTitle}
        </h1>
        <button
          type="button"
          onClick={closeSheet}
          aria-label={t("common.close")}
          className="justify-self-end text-xl leading-none text-[var(--sheet-muted)]"
        >
          ×
        </button>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        {holdExpiresAt && !["hold_expired", "race_lost", "summary"].includes(step) && (
          <p className="mb-3 text-center text-xs text-[var(--sheet-muted)]">
            {t("checkout.hold")} · <span className="font-mono text-[var(--sheet-fg)]">{holdLabel}</span>
          </p>
        )}

        {step === "summary" && (
          <>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center bg-[var(--fg)]/5 text-[0.55rem] uppercase tracking-wider text-[var(--sheet-muted)]">
                3D
              </div>
              <div>
                <p className="text-sm font-medium">
                  {snap.name} — {snap.edition}
                </p>
                <p className="text-lg font-semibold">{formatPrice(snap.price, "UZS", locale)}</p>
              </div>
            </div>
            {error && <p className="mt-4 text-center text-sm text-[var(--state-error)]">{error}</p>}
            <button
              type="button"
              disabled={loading || snap.phase === "sold_out" || offline}
              onClick={startHold}
              className="mt-auto w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)] disabled:opacity-50"
            >
              {loading ? t("checkout.reserving") : t("checkout.continue")}
            </button>
          </>
        )}

        {step === "identity" && (
          <>
            <input
              className="mt-4 w-full border-b border-[var(--sheet-border)] bg-transparent py-3 text-base outline-none"
              placeholder={t("checkout.name")}
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
            <input
              className="mt-4 w-full border-b border-[var(--sheet-border)] bg-transparent py-3 text-base outline-none"
              placeholder="+998 XX XXX XX XX"
              value={phone}
              onChange={e => setPhone(formatPhoneUz(e.target.value))}
              inputMode="tel"
            />
            {error && <p className="mt-2 text-sm text-[var(--state-error)]">{error}</p>}
            <button
              type="button"
              onClick={() => {
                if (!name.trim() || !isValidPhoneUz(phone)) {
                  setError(t("checkout.fillNamePhone"));
                  return;
                }
                setError("");
                setStep("delivery");
              }}
              className="mt-auto w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
            >
              {t("checkout.next")}
            </button>
          </>
        )}

        {step === "delivery" && (
          <>
            <div className="mt-4 flex gap-2">
              {(["delivery", "pickup"] as const).map(kind => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setDeliveryType(kind)}
                  className={`flex-1 border py-3 text-xs uppercase tracking-wider ${
                    deliveryType === kind
                      ? "border-[var(--btn)] bg-[var(--btn)] text-[var(--btn-text)]"
                      : "border-[var(--sheet-border)] text-[var(--sheet-muted)]"
                  }`}
                >
                  {kind === "delivery" ? t("checkout.deliveryType") : t("checkout.pickup")}
                </button>
              ))}
            </div>
            {deliveryType === "delivery" ? (
              <input
                className="mt-4 w-full border-b border-[var(--sheet-border)] bg-transparent py-3 text-base outline-none"
                placeholder={t("checkout.address")}
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            ) : (
              <p className="mt-4 text-sm text-[var(--sheet-muted)]">{DROP_CONFIG.pickupAddress}</p>
            )}
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="mt-auto w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
            >
              {t("checkout.toPayment")}
            </button>
          </>
        )}

        {step === "payment" && (
          <>
            <p className="mt-4 text-center text-2xl font-semibold">
              {formatPrice(snap.price, "UZS", locale)}
            </p>
            {error && <p className="mt-4 text-center text-sm text-[var(--state-error)]">{error}</p>}
            <label className="mt-4 flex items-start gap-2 text-xs text-[var(--sheet-muted)]">
              <input
                type="checkbox"
                checked={acceptedOffer}
                onChange={e => setAcceptedOffer(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                {t("checkout.acceptOffer")}{" "}
                <a href={asset("/legal/offer")} className="underline">
                  {t("checkout.publicOffer")}
                </a>{" "}
                {t("checkout.andDelivery")}
              </span>
            </label>
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => pay("paylov")}
                className="w-full rounded-lg bg-[#5b4dff] py-4 text-sm font-semibold text-white"
              >
                {t("checkout.payPaylov")}
              </button>
              <button
                type="button"
                onClick={() => pay("apple")}
                className="w-full rounded-lg bg-black py-3.5 text-sm text-white"
              >
                Apple Pay
              </button>
              <button
                type="button"
                onClick={() => pay("google")}
                className="w-full rounded-lg border border-[var(--sheet-border)] py-3.5 text-sm"
              >
                Google Pay
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--fg)]/20 border-t-[var(--fg)]" />
            <p className="mt-4 text-sm text-[var(--sheet-muted)]">{t("checkout.processingPayment")}</p>
          </div>
        )}

        {step === "pending" && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--state-warning)]/30 border-t-[var(--state-warning)]" />
            <h3 className="mt-6 text-lg font-semibold text-[var(--state-warning)]">
              {t("checkout.pendingTitle")}
            </h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--sheet-muted)]">
              {t("checkout.pendingBody")}
            </p>
          </div>
        )}

        {step === "hold_expired" && (
          <StatePanel
            title={t("checkout.holdExpired")}
            description={t("checkout.holdExpiredBody")}
            tone="warning"
          >
            <button
              type="button"
              onClick={startHold}
              disabled={loading}
              className="mt-8 w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)] disabled:opacity-50"
            >
              {loading ? t("checkout.reserving") : t("checkout.reserveAgain")}
            </button>
            <button
              type="button"
              onClick={closeSheet}
              className="mt-3 text-xs uppercase tracking-[0.15em] underline"
            >
              {t("common.close")}
            </button>
          </StatePanel>
        )}

        {step === "race_lost" && (
          <StatePanel
            title={t("checkout.raceLost")}
            description={t("checkout.raceLostBody")}
            tone="error"
          >
            <button
              type="button"
              onClick={closeSheet}
              className="mt-8 w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
            >
              {t("common.close")}
            </button>
          </StatePanel>
        )}

        {step === "payment_failed" && (
          <StatePanel
            title={t("checkout.paymentFailed")}
            description={t("checkout.paymentFailedBody")}
            tone="error"
          >
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="mt-6 w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
            >
              {t("receipt.tryAgain")}
            </button>
            {failedOrderId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openProfileOrder(failedOrderId);
                }}
                className="mt-3 text-xs uppercase tracking-[0.15em] underline"
              >
                {t("checkout.openReceipt")}
              </button>
            )}
          </StatePanel>
        )}
      </div>
      </div>
    </>
  );
}
