"use client";

import Link from "next/link";
import type { Order } from "@/lib/types";
import { formatPhoneUz, formatPrice } from "@/lib/format";
import { ScreenShell } from "./screen-shell";

const statusLabel: Record<Order["status"], string> = {
  paid: "Оплачен",
  pending: "Ожидает подтверждения",
  failed: "Оплата не прошла",
  refunded: "Возврат",
};

interface OrderReceiptScreenProps {
  order: Order;
}

export function OrderReceiptScreen({ order }: OrderReceiptScreenProps) {
  return (
    <ScreenShell>
      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Чек</p>
        <h1 className="mt-4 text-center text-2xl font-semibold tracking-tight">
          № {order.receipt}
        </h1>
        <p
          className={`mt-3 text-sm font-medium ${
            order.status === "paid"
              ? "text-emerald-700"
              : order.status === "pending"
                ? "text-amber-700"
                : order.status === "failed"
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)]"
          }`}
        >
          {statusLabel[order.status]}
        </p>

        <div className="mt-8 w-full max-w-sm space-y-3 border border-black/10 bg-white/30 px-5 py-5 text-sm">
          <Row label="Издание" value="SHIZARU OKSANA — 1st Edition" />
          <Row label="Сумма" value={formatPrice(order.amount)} />
          <Row label="Имя" value={order.buyer.name} />
          <Row label="Телефон" value={formatPhoneUz(order.buyer.phone)} />
          <Row
            label="Доставка"
            value={order.buyer.deliveryType === "pickup" ? "Самовывоз" : "Курьер"}
          />
          <Row label="Адрес" value={order.buyer.address} />
        </div>

        {order.status === "paid" && (
          <p className="mt-6 text-center text-xs text-amber-800">
            Ачивка «Владелец The4» добавлена в Taneesh
          </p>
        )}

        {order.status === "pending" && (
          <p className="mt-6 max-w-xs text-center text-xs text-[var(--muted)]">
            Банк обрабатывает платёж. Мы пришлём SMS, когда всё подтвердится.
          </p>
        )}

        {order.status === "failed" && (
          <Link
            href="/"
            className="mt-8 w-full max-w-sm bg-[var(--btn)] py-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#e8e6e1]"
          >
            Попробовать снова
          </Link>
        )}

        <Link
          href="/home"
          className="mt-6 text-xs uppercase tracking-[0.2em] underline underline-offset-4"
        >
          На главную
        </Link>
      </section>
    </ScreenShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
