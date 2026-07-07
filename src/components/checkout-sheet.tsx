"use client";

import { useEffect, useState } from "react";
import type { CheckoutResult, DropSnapshot } from "@/lib/api";
import { createHold, completeCheckout, DROP_CONFIG } from "@/lib/api";
import { formatPhoneUz, formatPrice, isValidPhoneUz } from "@/lib/format";

type Step = "summary" | "identity" | "delivery" | "payment" | "processing";

interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  snap: DropSnapshot;
  prefill?: { name?: string; phone?: string };
  onSuccess: (result: CheckoutResult) => void;
}

export function CheckoutSheet({
  open,
  onClose,
  snap,
  prefill,
  onSuccess,
}: CheckoutSheetProps) {
  const [step, setStep] = useState<Step>("summary");
  const [holdId, setHoldId] = useState<string | null>(null);
  const [name, setName] = useState(prefill?.name || "");
  const [phone, setPhone] = useState(prefill?.phone ? formatPhoneUz(prefill.phone) : "+998 ");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("summary");
      setError("");
      setHoldId(null);
      if (prefill?.name) setName(prefill.name);
      if (prefill?.phone) setPhone(formatPhoneUz(prefill.phone));
    } else {
      document.body.style.overflow = "";
    }
  }, [open, prefill?.name, prefill?.phone]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
  }, [open]);

  if (!open) return null;

  const thumb = snap.images[0];

  const startHold = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await createHold();
      setHoldId(data.holdId);
      setStep("identity");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    if (!holdId) return;
    if (!name.trim()) {
      setError("Введите имя");
      return;
    }
    if (!isValidPhoneUz(phone)) {
      setError("Введите телефон +998 …");
      return;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      setError("Введите адрес");
      return;
    }

    setStep("processing");
    setError("");
    try {
      const result = await completeCheckout({
        holdId,
        name: name.trim(),
        phone,
        deliveryType,
        address: deliveryType === "pickup" ? DROP_CONFIG.pickupAddress : address.trim(),
      });
      onSuccess(result);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка оплаты");
      setStep("payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-slide-up relative flex max-h-[60vh] min-h-[50vh] w-full flex-col bg-[#f5f4f0] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_48px_rgba(0,0,0,0.15)]">
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-black/15" />

        {step === "summary" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Order Summary
            </p>
            <div className="mt-6 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb} alt="" className="h-16 w-16 object-contain" />
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
              disabled={loading || snap.phase === "sold_out"}
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
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
            <p className="mt-1 text-center text-xs text-[var(--muted)]">
              Hold активен · {DROP_CONFIG.holdMinutes} мин
            </p>
            {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={pay}
                className="w-full rounded-lg bg-[#5b4dff] py-4 text-sm font-semibold text-white"
              >
                ОПЛАТИТЬ ЧЕРЕЗ PAYLOV
              </button>
              <button
                type="button"
                onClick={pay}
                className="w-full rounded-lg bg-black py-3.5 text-sm text-white"
              >
                Apple Pay
              </button>
              <button
                type="button"
                onClick={pay}
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
            <p className="mt-4 text-sm text-[var(--muted)]">Paylov…</p>
          </div>
        )}
      </div>
    </div>
  );
}
