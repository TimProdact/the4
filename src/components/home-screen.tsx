"use client";

import Link from "next/link";
import { DROP_CONFIG } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { ScreenShell } from "./screen-shell";

const drops = [
  {
    slug: "oksana-01",
    name: DROP_CONFIG.name,
    edition: DROP_CONFIG.edition,
    price: DROP_CONFIG.price,
    href: "/",
    status: "live" as const,
  },
];

export function HomeScreen() {
  return (
    <ScreenShell>
      <section className="flex flex-1 flex-col px-6 pb-8 pt-2">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">The4</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Анти-маркетплейс. Один экран — один дроп.</p>

        <ul className="mt-10 space-y-4">
          {drops.map(d => (
            <li key={d.slug}>
              <Link
                href={d.href}
                className="block border border-black/10 bg-white/40 px-5 py-5 transition active:scale-[0.99]"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {d.edition}
                  <span className="mx-2 text-[var(--accent)]">· Live</span>
                </p>
                <p className="mt-2 text-lg font-medium">{d.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{formatPrice(d.price)}</p>
              </Link>
            </li>
          ))}
        </ul>

        <nav className="mt-auto flex flex-wrap gap-4 pt-8 text-[0.65rem] uppercase tracking-[0.15em] text-[var(--muted)]">
          <Link href="/legal/offer" className="underline underline-offset-4">
            Оферта
          </Link>
          <Link href="/legal/delivery" className="underline underline-offset-4">
            Доставка
          </Link>
          <Link href="/legal/refund" className="underline underline-offset-4">
            Возврат
          </Link>
          <Link href="/demo" className="underline underline-offset-4">
            Demo
          </Link>
          <Link href="/admin" className="underline underline-offset-4">
            Admin
          </Link>
        </nav>
      </section>
    </ScreenShell>
  );
}
