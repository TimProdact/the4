import Link from "next/link";

const screens = [
  { href: "/", label: "Active Drop" },
  { href: "/home", label: "Home / Archive" },
  { href: "/admin", label: "Admin" },
  { href: "/?model_error=1", label: "3D load error" },
  { href: "/order/1001", label: "Order receipt (если есть заказ)" },
  { href: "/legal/offer", label: "Оферта" },
];

export default function DemoPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-10">
      <h1 className="text-xl font-semibold">The4 — все экраны</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Mock-флоу без реального бэкенда. Pre-drop / Sold out / Paused — через{" "}
        <Link href="/admin" className="underline">
          Admin
        </Link>
        .
      </p>
      <ul className="mt-8 space-y-3">
        {screens.map(s => (
          <li key={s.href}>
            <Link href={s.href} className="text-sm underline underline-offset-4">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-10 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--fg)]">Checkout mock</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Paylov — успешная оплата → /order/[id]</li>
          <li>Apple Pay — pending → paid</li>
          <li>Google Pay — payment failed</li>
          <li>Hold expired — подожди 5 мин в checkout</li>
          <li>Race lost — Admin → stock 0 во время checkout</li>
          <li>All held — Admin → stock = holds count</li>
        </ul>
      </section>
    </main>
  );
}
