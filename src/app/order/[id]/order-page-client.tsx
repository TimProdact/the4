"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchOrder } from "@/lib/api";
import { asset } from "@/lib/asset";
import { useProfile } from "@/lib/profile-context";
import { useT } from "@/lib/i18n";
import type { Order } from "@/lib/types";

export function OrderPageClient({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { openProfileOrder } = useProfile();
  const { t, translateError } = useT();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      const num = Number(id);
      setOrderId(num);
      fetchOrder(num)
        .then(setOrder)
        .catch(e => setError(e instanceof Error ? translateError(e.message) : t("common.error")));
    });
  }, [params, t, translateError]);

  useEffect(() => {
    if (!order || redirected) return;
    setRedirected(true);
    openProfileOrder(order.id);
    router.replace(asset("/"));
  }, [order, openProfileOrder, redirected, router]);

  if (error) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--bg)] px-6 text-center text-[var(--fg)]">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{t("orderPage.receipt")}</p>
        <h1 className="mt-4 text-xl font-semibold">{t("orderPage.notFound")}</h1>
        <p className="mt-3 max-w-sm text-sm text-[var(--muted)]">
          {orderId ? t("orderPage.notFoundBody", { id: orderId }) : error}
        </p>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] items-center justify-center bg-[var(--bg)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--fg)]/20 border-t-[var(--fg)]" />
    </main>
  );
}
