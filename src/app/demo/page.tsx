import Link from "next/link";
import { DROP_THEMES } from "@/lib/drop-themes";
import { getThemeDropStatus } from "@/lib/theme-drop-status";

const dropStates = [
  { href: "/?preview=active", label: "Active Drop" },
  { href: "/?preview=pre_drop", label: "Pre-Drop" },
  { href: "/?preview=sold_out", label: "Sold Out" },
];

const checkoutStates = [
  { href: "/?preview=active&checkout=summary", label: "Checkout · summary" },
  { href: "/?preview=active&checkout=hold_expired", label: "Checkout · hold expired" },
  { href: "/?preview=active&checkout=race_lost", label: "Checkout · race lost" },
  { href: "/?preview=active&checkout=payment_failed", label: "Checkout · payment failed" },
  { href: "/?preview=active&checkout=pending", label: "Checkout · pending bank" },
];

const pages = [
  { href: "/", label: "Live drop" },
  { href: "/profile", label: "Profile (page)" },
  { href: "/admin", label: "Admin" },
  { href: "/demo", label: "Demo hub (эта страница)" },
];

const orders = [
  { href: "/order/1001", label: "Чек · paid (1001)" },
  { href: "/order/1002", label: "Чек · pending (1002)" },
  { href: "/order/1003", label: "Чек · failed (1003)" },
];

const legal = [
  { href: "/legal/offer", label: "Оферта" },
  { href: "/legal/delivery", label: "Доставка" },
  { href: "/legal/refund", label: "Возврат" },
  { href: "/legal/privacy", label: "Privacy" },
];

export default function DemoPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] px-6 py-10 text-[var(--fg)]">
      <h1 className="text-xl font-semibold">The4 — QA / все состояния</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Каждое состояние наследует тему. Добавь <code className="text-[var(--accent)]">?theme=plant</code>{" "}
        к любой ссылке. Admin: <code className="text-[var(--accent)]">THE4ADMIN</code> · VIP:{" "}
        <code className="text-[var(--accent)]">THE4</code>
      </p>

      <Section title="Фазы дропа">
        <LinkList items={dropStates} />
      </Section>

      <Section title="Checkout (preview)">
        <LinkList items={checkoutStates} />
      </Section>

      <Section title="Темы (3D)">
        <ul className="mt-3 flex flex-wrap gap-2">
          {DROP_THEMES.map(t => {
            const status = getThemeDropStatus(t.id);
            const label =
              status.phase === "active"
                ? `${t.name} · ${status.stock}/${status.totalStock}`
                : status.phase === "pre_drop"
                  ? `${t.name} · Pre-Drop`
                  : `${t.name} · Sold Out`;
            return (
            <li key={t.id}>
              <Link
                href={`/?theme=${t.id}`}
                className="inline-block rounded-full bg-[var(--stock-pill-bg)] px-3 py-1 text-xs text-[var(--stock-pill-text)]"
              >
                {label}
              </Link>
            </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Страницы">
        <LinkList items={pages} />
      </Section>

      <Section title="Чеки">
        <LinkList items={orders} />
        <p className="mt-2 text-xs text-[var(--muted)]">
          Демо-заказы 1001–1003 создаются автоматически в localStorage при первом визите.
        </p>
      </Section>

      <Section title="Legal">
        <LinkList items={legal} />
      </Section>

      <Section title="Deep links">
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/?name=Demo&phone=998900051902" className="underline">
              Checkout prefill
            </Link>
          </li>
          <li>
            <Link href="/?preview=active&theme=heart" className="underline">
              Active + Valentine theme
            </Link>
          </li>
        </ul>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{title}</h2>
      {children}
    </section>
  );
}

function LinkList({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map(s => (
        <li key={s.href}>
          <Link href={s.href} className="text-sm underline underline-offset-4">
            {s.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
