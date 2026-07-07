"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CheckoutResult, DropSnapshot } from "@/lib/api";
import {
  completeCheckout,
  createHold,
  DROP_CONFIG,
  releaseHold,
} from "@/lib/api";
import { formatPhoneUz, formatPrice, isValidPhoneUz } from "@/lib/format";
import { useHoldCountdown } from "@/hooks/use-hold-countdown";
import { StatePanel } from "./state-panel";
import type { CheckoutPreview } from "@/lib/preview";

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

interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  snap: DropSnapshot;
  prefill?: { name?: string; phone?: string };
  offline?: boolean;
  initialStep?: CheckoutPreview;
  previewFailedOrderId?: number;
}

export function CheckoutSheet({
  open,
  onClose,
  snap,
  prefill,
  offline,
  initialStep,
  previewFailedOrderId,
}: CheckoutSheetProps) {
  const router = useRouter();
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

  const { expired, label: holdLabel } = useHoldCountdown(holdExpiresAt);

  useEffect(() => {
    if (!open) return;
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

  const handleSuccess = (result: CheckoutResult) => {
    onClose();
    router.push(`/order/${result.orderId}`);
  };

  const startHold = async () => {
    if (offline) {
      setError("Нет сети — подключитесь и попробуйте снова");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await createHold();
      setHoldId(data.holdId);
      setHoldExpiresAt(data.expiresAt);
      setStep("identity");
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "ALL_HELD") {
        setError("Все экземпляры в резерве. Попробуйте через минуту.");
      } else if (err.code === "SOLD_OUT" || err.code === "RACE_LOST") {
        setStep("race_lost");
      } else if (err.code === "PAUSED") {
        setError("Дроп на паузе");
      } else {
        setError(err.message || "Ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  const pay = async (paymentMethod: "paylov" | "apple" | "google") => {
    if (!holdId || offline) return;
    if (!name.trim() || !isValidPhoneUz(phone)) {
      setError("Заполните имя и телефон");
      setStep("identity");
      return;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      setError("Введите адрес");
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
      });

      if (result.status === "pending") {
        setStep("pending");
        window.setTimeout(() => handleSuccess({ ...result, status: "paid" }), 2500);
        return;
      }
      handleSuccess(result);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "HOLD_EXPIRED") {
        setStep("hold_expired");
        return;
      }
      if (err.code === "RACE_LOST" || err.code === "SOLD_OUT") {
        setStep("race_lost");
        return;
      }
      if (err.code === "PAYMENT_FAILED") {
        setFailedOrderId((err as Error & { orderId?: number }).orderId ?? null);
        setStep("payment_failed");
        return;
      }
      setError(err.message || "Ошибка оплаты");
      setStep("payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={closeSheet}
      />

      <div className="animate-slide-up relative flex max-h-[70vh] min-h-[50vh] w-full flex-col bg-[var(--sheet-bg)] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-[var(--sheet-fg)] shadow-[0_-12px_48px_rgba(0,0,0,0.15)]">
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-[var(--fg)]/15" />

        {holdExpiresAt && !["hold_expired", "race_lost", "summary"].includes(step) && (
          <p className="mb-3 text-center text-xs text-[var(--sheet-muted)]">
            Резерв · <span className="font-mono text-[var(--sheet-fg)]">{holdLabel}</span>
          </p>
        )}

        {step === "summary" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--sheet-muted)]">
              Order Summary
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center bg-[var(--fg)]/5 text-[0.55rem] uppercase tracking-wider text-[var(--sheet-muted)]">
                3D
              </div>
              <div>
                <p className="text-sm font-medium">
                  {snap.name} — {snap.edition}
                </p>
                <p className="text-lg font-semibold">{formatPrice(snap.price)}</p>
              </div>
            </div>
            {error && <p className="mt-4 text-center text-sm text-[var(--state-error)]">{error}</p>}
            <button
              type="button"
              disabled={loading || snap.phase === "sold_out" || offline}
              onClick={startHold}
              className="mt-auto w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)] disabled:opacity-50"
            >
              {loading ? "Резерв…" : "Продолжить"}
            </button>
          </>
        )}

        {step === "identity" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--sheet-muted)]">
              Ваши данные
            </p>
            <input
              className="mt-6 w-full border-b border-[var(--sheet-border)] bg-transparent py-3 text-base outline-none"
              placeholder="Имя"
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
                  setError("Заполните имя и телефон");
                  return;
                }
                setError("");
                setStep("delivery");
              }}
              className="mt-auto w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
            >
              Далее
            </button>
          </>
        )}

        {step === "delivery" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--sheet-muted)]">
              Доставка
            </p>
            <div className="mt-6 flex gap-2">
              {(["delivery", "pickup"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDeliveryType(t)}
                  className={`flex-1 border py-3 text-xs uppercase tracking-wider ${
                    deliveryType === t
                      ? "border-[var(--btn)] bg-[var(--btn)] text-[var(--btn-text)]"
                      : "border-[var(--sheet-border)] text-[var(--sheet-muted)]"
                  }`}
                >
                  {t === "delivery" ? "Доставка" : "Самовывоз"}
                </button>
              ))}
            </div>
            {deliveryType === "delivery" ? (
              <input
                className="mt-4 w-full border-b border-[var(--sheet-border)] bg-transparent py-3 text-base outline-none"
                placeholder="Адрес"
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
              К оплате
            </button>
          </>
        )}

        {step === "payment" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--sheet-muted)]">
              Оплата
            </p>
            <p className="mt-4 text-center text-2xl font-semibold">{formatPrice(snap.price)}</p>
            {error && <p className="mt-4 text-center text-sm text-[var(--state-error)]">{error}</p>}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => pay("paylov")}
                className="w-full rounded-lg bg-[#5b4dff] py-4 text-sm font-semibold text-white"
              >
                ОПЛАТИТЬ ЧЕРЕЗ PAYLOV
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
            <p className="mt-4 text-sm text-[var(--sheet-muted)]">Обработка платежа…</p>
          </div>
        )}

        {step === "pending" && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--state-warning)]/30 border-t-[var(--state-warning)]" />
            <h3 className="mt-6 text-lg font-semibold text-[var(--state-warning)]">Ожидаем банк</h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--sheet-muted)]">
              Платёж в обработке. Обычно это занимает несколько секунд.
            </p>
          </div>
        )}

        {step === "hold_expired" && (
          <StatePanel
            title="Резерв сгорел"
            description="5 минут истекли. Забронируй снова, чтобы продолжить покупку."
            tone="warning"
          >
            <button
              type="button"
              onClick={startHold}
              disabled={loading}
              className="mt-8 w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)] disabled:opacity-50"
            >
              {loading ? "Резерв…" : "Забронировать снова"}
            </button>
            <button
              type="button"
              onClick={closeSheet}
              className="mt-3 text-xs uppercase tracking-[0.15em] underline"
            >
              Закрыть
            </button>
          </StatePanel>
        )}

        {step === "race_lost" && (
          <StatePanel
            title="Успели раньше"
            description="Последний экземпляр только что забрали. Edition closed."
            tone="error"
          >
            <button
              type="button"
              onClick={closeSheet}
              className="mt-8 w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
            >
              Закрыть
            </button>
          </StatePanel>
        )}

        {step === "payment_failed" && (
          <StatePanel
            title="Оплата отклонена"
            description="Банк не подтвердил транзакцию. Попробуй другой способ или карту."
            tone="error"
          >
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="mt-6 w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
            >
              Попробовать снова
            </button>
            {failedOrderId && (
              <button
                type="button"
                onClick={() => router.push(`/order/${failedOrderId}`)}
                className="mt-3 text-xs uppercase tracking-[0.15em] underline"
              >
                Открыть чек
              </button>
            )}
          </StatePanel>
        )}
      </div>
    </div>
  );
}
