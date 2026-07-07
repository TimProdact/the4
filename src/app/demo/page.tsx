import Link from "next/link";
import { DROP_THEMES } from "@/lib/drop-themes";

const dropStates = [
  { href: "/?preview=active", label: "Active Drop" },
  { href: "/?preview=pre_drop", label: "Pre-Drop" },
  { href: "/?preview=sold_out", label: "Sold Out" },
  { href: "/?preview=paused", label: "Paused" },
  { href: "/?preview=offline", label: "Offline banner" },
  { href: "/?preview=all_held", label: "All Held" },
];

const checkoutStates = [
  { href: "/?preview=checkout_summary", label: "Checkout · Summary" },
  { href: "/?preview=checkout_hold_expired", label: "Checkout · Hold expired" },
  { href: "/?preview=checkout_race_lost", label: "Checkout · Race lost" },
  { href: "/?preview=checkout_payment_failed", label: "Checkout · Payment failed" },
  { href: "/?preview=checkout_pending", label: "Checkout · Pending" },
];

const pages = [
  { href: "/home", label: "Home / Archive" },
  { href: "/admin", label: "Admin" },
  { href: "/order/1001", label: "Order receipt (paid)" },
  { href: "/legal/offer", label: "Оферта" },
];

export default function DemoPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-10 text-[var(--fg)]">
      <h1 className="text-xl font-semibold">The4 — все состояния</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Каждое состояние наследует тему. Добавь <code className="text-[var(--accent)]">?theme=plant</code>{" "}
        к любой ссылке.
      </p>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Фазы дропа
        </h2>
        <ul className="mt-3 space-y-2">
          {dropStates.map(s => (
            <li key={s.href}>
              <Link href={s.href} className="text-sm underline underline-offset-4">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Checkout
        </h2>
        <ul className="mt-3 space-y-2">
          {checkoutStates.map(s => (
            <li key={s.href}>
              <Link href={s.href} className="text-sm underline underline-offset-4">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Темы (3D)
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {DROP_THEMES.map(t => (
            <li key={t.id}>
              <Link
                href={`/?theme=${t.id}`}
                className="inline-block rounded-full bg-[var(--stock-pill-bg)] px-3 py-1 text-xs text-[var(--stock-pill-text)]"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Страницы
        </h2>
        <ul className="mt-3 space-y-2">
          {pages.map(s => (
            <li key={s.href}>
              <Link href={s.href} className="text-sm underline underline-offset-4">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
