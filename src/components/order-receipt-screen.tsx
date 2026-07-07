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

const statusTone: Record<Order["status"], string> = {
  paid: "bg-[var(--stock-pill-bg)] text-[var(--state-success)]",
  pending: "bg-[var(--stock-pill-bg)] text-[var(--state-warning)]",
  failed: "bg-[var(--state-error-bg)] text-[var(--state-error)]",
  refunded: "bg-[var(--stock-pill-bg)] text-[var(--muted)]",
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
        <span
          className={`mt-3 rounded-full px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${statusTone[order.status]}`}
        >
          {statusLabel[order.status]}
        </span>

        <div className="mt-8 w-full max-w-sm space-y-3 border border-[var(--sheet-border)] bg-[var(--fg)]/5 px-5 py-5 text-sm">
          <Row label="Издание" value={`${order.receipt}`} />
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
          <p className="mt-6 text-center text-xs text-[var(--state-success)]">
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
            className="mt-8 w-full max-w-sm bg-[var(--btn)] py-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
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
