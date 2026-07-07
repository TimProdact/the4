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
}

export function CheckoutSheet({
  open,
  onClose,
  snap,
  prefill,
  offline,
}: CheckoutSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("summary");
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
    setStep("summary");
    setError("");
    setHoldId(null);
    setHoldExpiresAt(null);
    setFailedOrderId(null);
    if (prefill?.name) setName(prefill.name);
    if (prefill?.phone) setPhone(formatPhoneUz(prefill.phone));
  }, [open, prefill?.name, prefill?.phone]);

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

      <div className="animate-slide-up relative flex max-h-[70vh] min-h-[50vh] w-full flex-col bg-[#f5f4f0] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_48px_rgba(0,0,0,0.15)]">
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-black/15" />

        {holdExpiresAt && !["hold_expired", "race_lost", "summary"].includes(step) && (
          <p className="mb-3 text-center text-xs text-[var(--muted)]">
            Резерв · <span className="font-mono text-[var(--fg)]">{holdLabel}</span>
          </p>
        )}

        {step === "summary" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Order Summary
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center bg-black/5 text-[0.55rem] uppercase tracking-wider text-[var(--muted)]">
                3D
              </div>
              <div>
                <p className="text-sm font-medium">
                  {snap.name} — {snap.edition}
                </p>
                <p className="text-lg font-semibold">{formatPrice(snap.price)}</p>
              </div>
            </div>
            {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
            <button
              type="button"
              disabled={loading || snap.phase === "sold_out" || offline}
              onClick={startHold}
              className="mt-auto w-full bg-black py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50"
            >
              {loading ? "Резерв…" : "Продолжить"}
            </button>
          </>
        )}

        {step === "identity" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Ваши данные
            </p>
            <input
              className="mt-6 w-full border-b border-black/20 bg-transparent py-3 text-base outline-none"
              placeholder="Имя"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
            <input
              className="mt-4 w-full border-b border-black/20 bg-transparent py-3 text-base outline-none"
              placeholder="+998 XX XXX XX XX"
              value={phone}
              onChange={e => setPhone(formatPhoneUz(e.target.value))}
              inputMode="tel"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
              className="mt-auto w-full bg-black py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white"
            >
              Далее
            </button>
          </>
        )}

        {step === "delivery" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
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
                      ? "border-black bg-black text-white"
                      : "border-black/20 text-black/60"
                  }`}
                >
                  {t === "delivery" ? "Доставка" : "Самовывоз"}
                </button>
              ))}
            </div>
            {deliveryType === "delivery" ? (
              <input
                className="mt-4 w-full border-b border-black/20 bg-transparent py-3 text-base outline-none"
                placeholder="Адрес"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">{DROP_CONFIG.pickupAddress}</p>
            )}
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="mt-auto w-full bg-black py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white"
            >
              К оплате
            </button>
          </>
        )}

        {step === "payment" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Оплата
            </p>
            <p className="mt-4 text-center text-2xl font-semibold">{formatPrice(snap.price)}</p>
            {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
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
                className="w-full rounded-lg border border-black/15 py-3.5 text-sm"
              >
                Google Pay
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            <p className="mt-4 text-sm text-[var(--muted)]">Обработка платежа…</p>
          </div>
        )}

        {step === "pending" && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-600" />
            <h3 className="mt-6 text-lg font-semibold">Ожидаем банк</h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
              Платёж в обработке. Обычно это занимает несколько секунд.
            </p>
          </div>
        )}

        {step === "hold_expired" && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <h3 className="text-lg font-semibold">Резерв сгорел</h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
              5 минут истекли. Забронируй снова, чтобы продолжить покупку.
            </p>
            <button
              type="button"
              onClick={startHold}
              disabled={loading}
              className="mt-8 w-full bg-black py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50"
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
          </div>
        )}

        {step === "race_lost" && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <h3 className="text-lg font-semibold uppercase tracking-wide text-[var(--accent)]">
              Успели раньше
            </h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
              Последний экземпляр только что забрали. Edition closed.
            </p>
            <button
              type="button"
              onClick={closeSheet}
              className="mt-8 w-full bg-black py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white"
            >
              Закрыть
            </button>
          </div>
        )}

        {step === "payment_failed" && (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <h3 className="text-lg font-semibold">Оплата отклонена</h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
              Банк не подтвердил транзакцию. Попробуй другой способ или карту.
            </p>
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="mt-6 w-full bg-black py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white"
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
          </div>
        )}
      </div>
    </div>
  );
}
