"use client";

import { useEffect, useState } from "react";
import { fetchOrder } from "@/lib/api";
import type { Order } from "@/lib/types";
import { OrderReceiptScreen } from "@/components/order-receipt-screen";

export function OrderPageClient({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      fetchOrder(Number(id))
        .then(setOrder)
        .catch(e => setError(e instanceof Error ? e.message : "Ошибка"));
    });
  }, [params]);

  if (error) {
    return (
      <main className="flex h-[100dvh] items-center justify-center px-6 text-center">
        <p>{error}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
      </main>
    );
  }

  return <OrderReceiptScreen order={order} />;
}
