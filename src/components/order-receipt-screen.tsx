"use client";

import Link from "next/link";
import type { Order } from "@/lib/types";
import { DROP_CONFIG } from "@/lib/drop-config";
import { asset } from "@/lib/asset";
import { formatPhoneUz, formatPrice, formatDateTime } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { ScreenShell } from "./screen-shell";

const statusTone: Record<Order["status"], string> = {
  paid: "bg-[var(--stock-pill-bg)] text-[var(--state-success)]",
  pending: "bg-[var(--stock-pill-bg)] text-[var(--state-warning)]",
  failed: "bg-[var(--state-error-bg)] text-[var(--state-error)]",
  refunded: "bg-[var(--stock-pill-bg)] text-[var(--muted)]",
};

interface OrderReceiptContentProps {
  order: Order;
  embedded?: boolean;
}

export function OrderReceiptContent({ order, embedded = false }: OrderReceiptContentProps) {
  const { t, locale } = useT();

  const statusLabel: Record<Order["status"], string> = {
    paid: t("orderStatus.paid"),
    pending: t("orderStatus.pending"),
    failed: t("orderStatus.failed"),
    refunded: t("orderStatus.refunded"),
  };

  const editionLine = [order.productName || DROP_CONFIG.name, order.edition]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={embedded ? "space-y-6" : "flex flex-1 flex-col items-center justify-center px-6 pb-8"}>
      <div className={embedded ? "" : "flex w-full max-w-sm flex-col items-center"}>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {t("receipt.title")}
        </p>
        <h2
          className={`font-semibold tracking-tight ${embedded ? "mt-3 text-xl" : "mt-4 text-center text-2xl"}`}
        >
          № {order.receipt}
        </h2>
        <span
          className={`mt-3 inline-block px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${statusTone[order.status]}`}
        >
          {statusLabel[order.status]}
        </span>
      </div>

      <div
        className={`w-full space-y-3 border border-[var(--fg)]/10 px-4 py-4 text-sm ${
          embedded ? "" : "mt-8 max-w-sm"
        }`}
      >
        <Row label={t("receipt.edition")} value={editionLine} />
        <Row label={t("receipt.amount")} value={formatPrice(order.amount, "UZS", locale)} />
        {order.paymentMethod && (
          <Row label={t("receipt.payment")} value={order.paymentMethod.toUpperCase()} />
        )}
        <Row label={t("receipt.name")} value={order.buyer.name} />
        <Row label={t("receipt.phone")} value={formatPhoneUz(order.buyer.phone)} />
        <Row
          label={t("receipt.delivery")}
          value={order.buyer.deliveryType === "pickup" ? t("receipt.pickup") : t("receipt.courier")}
        />
        <Row label={t("receipt.address")} value={order.buyer.address} />
        <Row label={t("receipt.date")} value={formatDateTime(order.createdAt, locale)} />
      </div>

      {order.status === "refunded" && (
        <p className="max-w-xs text-center text-xs text-[var(--muted)]">
          {t("receipt.refundNote")}
        </p>
      )}

      {(order.status === "paid" || order.status === "pending") && (
        <a
          href={DROP_CONFIG.sellerTelegram}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full bg-[var(--btn)] py-4 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)] transition active:scale-[0.99] ${
            embedded ? "" : "mt-8 max-w-sm"
          }`}
        >
          {t("receipt.contactSeller")}
        </a>
      )}

      {order.status === "failed" && !embedded && (
        <Link
          href={asset("/")}
          className="mt-8 w-full max-w-sm bg-[var(--btn)] py-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)]"
        >
          {t("receipt.tryAgain")}
        </Link>
      )}

      {order.status === "paid" && !embedded && (
        <Link
          href={asset("/legal/refund")}
          className="mt-6 text-xs uppercase tracking-[0.2em] underline underline-offset-4"
        >
          {t("receipt.requestRefund")}
        </Link>
      )}
    </div>
  );
}

interface OrderReceiptScreenProps {
  order: Order;
}

export function OrderReceiptScreen({ order }: OrderReceiptScreenProps) {
  return (
    <ScreenShell>
      <OrderReceiptContent order={order} />
    </ScreenShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--fg)]/10 pb-3 last:border-0 last:pb-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
