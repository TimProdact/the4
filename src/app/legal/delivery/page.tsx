import Link from "next/link";

export default function DeliveryPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-10">
      <Link href="/home" className="text-xs uppercase tracking-widest underline">
        ← Archive
      </Link>
      <h1 className="mt-8 text-2xl font-semibold">Доставка</h1>
      <div className="mt-6 max-w-lg space-y-4 text-sm text-[var(--muted)]">
        <p>Курьерская доставка по Ташкенту — 2–5 рабочих дней после подтверждения оплаты.</p>
        <p>Самовывоз: Magic City Event Hall, Ташкент.</p>
        <p>Международная доставка обсуждается индивидуально после заказа.</p>
      </div>
    </main>
  );
}
