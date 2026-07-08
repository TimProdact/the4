"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminAction,
  adminFetch,
  adminLogin,
  adminLogout,
  DROP_CONFIG,
  type AdminSnapshot,
} from "@/lib/api";
import { getAnalyticsSummary, resetAnalytics } from "@/lib/analytics";
import { DROP_THEMES } from "@/lib/drop-themes";
import { asset } from "@/lib/asset";
import { formatPrice } from "@/lib/format";
import { PREVIEW_CYCLE, PREVIEW_LABELS } from "@/lib/preview";
import type { Order, OrderStatus } from "@/lib/types";

const TOKEN_KEY = "the4_admin_token";
const ADMIN_BUILD = "2026-07-08-v3";

type Tab =
  | "dashboard"
  | "drop"
  | "orders"
  | "customers"
  | "stock"
  | "waitlist"
  | "analytics"
  | "content"
  | "payments"
  | "settings"
  | "team";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Дашборд" },
  { id: "drop", label: "Дроп" },
  { id: "orders", label: "Заказы" },
  { id: "customers", label: "Покупатели" },
  { id: "stock", label: "Сток" },
  { id: "waitlist", label: "Waitlist" },
  { id: "analytics", label: "Аналитика" },
  { id: "content", label: "Контент" },
  { id: "payments", label: "Paylov" },
  { id: "settings", label: "Настройки" },
  { id: "team", label: "Команда" },
];

export function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AdminSnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stockInput, setStockInput] = useState("14");
  const [orderStatus, setOrderStatus] = useState<"all" | OrderStatus>("all");
  const [orderQuery, setOrderQuery] = useState("");

  const load = useCallback(async (t: string) => {
    const snap = await adminFetch(t);
    setData(snap);
    setStockInput(String(snap.stock));
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      load(saved).catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      });
    }
  }, [load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const t = await adminLogin(password);
      sessionStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      await load(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const act = async (action: string, payload: Record<string, unknown> = {}) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const snap = await adminAction(token, action, payload);
      setData(snap);
      if (typeof snap.stock === "number") setStockInput(String(snap.stock));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (token) adminLogout(token);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setData(null);
  };

  const metrics = useMemo(() => computeMetrics(data), [data]);
  const analytics = useMemo(() => getAnalyticsSummary(), [data, tab]);

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    return data.orders.filter(o => {
      if (orderStatus !== "all" && o.status !== orderStatus) return false;
      if (!orderQuery.trim()) return true;
      const q = orderQuery.toLowerCase();
      return (
        o.receipt.toLowerCase().includes(q) ||
        o.buyer.name.toLowerCase().includes(q) ||
        o.buyer.phone.includes(q)
      );
    });
  }, [data, orderStatus, orderQuery]);

  const customers = useMemo(() => (data ? buildCustomers(data.orders) : []), [data]);

  if (!token) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#111] px-6 text-white">
        <form onSubmit={login} className="w-full max-w-sm">
          <h1 className="text-center text-lg font-semibold uppercase tracking-[0.2em]">
            The4 Admin
          </h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Пароль"
            className="mt-8 w-full border-b border-white/30 bg-transparent py-3 text-center outline-none"
          />
          {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-white py-3 text-sm font-semibold uppercase tracking-widest text-black"
          >
            Войти
          </button>
          <p className="mt-4 text-center text-xs text-white/40">По умолчанию: THE4ADMIN</p>
        </form>
      </main>
    );
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#eae8e3] text-[#111]">
      <aside className="flex w-[4.5rem] shrink-0 flex-col border-r border-black/10 bg-[#111] text-white md:w-52">
        <div className="border-b border-white/10 px-3 py-5 md:px-4">
          <p className="text-sm font-bold uppercase tracking-[0.2em] md:text-base">The4</p>
          <p className="mt-1 hidden text-[0.65rem] uppercase tracking-wider text-white/45 md:block">
            Панель управления
          </p>
          <p className="mt-2 hidden text-[0.6rem] text-emerald-400/90 md:block">{ADMIN_BUILD}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              title={t.label}
              className={`rounded-md px-2 py-2.5 text-left text-[0.65rem] uppercase tracking-wider transition md:px-3 md:text-[0.7rem] ${
                tab === t.id
                  ? "bg-white text-black"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="md:hidden">{t.label.slice(0, 3)}</span>
              <span className="hidden md:inline">{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="w-full text-[0.65rem] uppercase tracking-widest text-white/55 underline"
          >
            Выйти
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-[#eae8e3]/95 px-4 py-4 backdrop-blur md:px-8">
          <h1 className="text-lg font-semibold">{TABS.find(t => t.id === tab)?.label}</h1>
          <p className="text-xs text-black/45">The4 Admin · {ADMIN_BUILD}</p>
        </header>

        <div className="px-4 py-6 md:px-8">
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {data && tab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard title="Сегодня · заказы" value={String(metrics.todayOrders)} />
                <MetricCard title="Сегодня · выручка" value={formatPrice(metrics.todayRevenue)} />
                <MetricCard title="Конверсия checkout" value={`${metrics.conversion}%`} />
                <MetricCard title="Дроп · фаза" value={metrics.phase} />
                <MetricCard title="Остаток" value={`${data.available} / ${data.stock}`} />
                <MetricCard title="Активные holds" value={String(data.holds.length)} />
              </div>
              {metrics.alerts.map(a => (
                <div
                  key={a}
                  className="border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                >
                  {a}
                </div>
              ))}
              <Section title="Экраны дропа (preview URL)">
                <p className="mb-3 text-sm text-black/55">
                  Открой состояние на витрине или жми бейдж на дропе для цикла.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PREVIEW_CYCLE.map(p => (
                    <a
                      key={p}
                      href={asset(`/?preview=${p}`)}
                      className="flex items-center justify-between border border-black/10 bg-white px-3 py-2.5 text-sm hover:border-black/25"
                    >
                      <span>{PREVIEW_LABELS[p]}</span>
                      <span className="font-mono text-[0.65rem] text-black/40">?preview={p}</span>
                    </a>
                  ))}
                </div>
              </Section>
            </div>
          )}

        {data && tab === "drop" && (
          <div className="space-y-6">
            <Section title="Фаза и сток">
              <p className="text-2xl font-semibold">
                {data.available} доступно · {data.stock} на складе · {data.totalStock} всего
              </p>
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={data.totalStock}
                  value={stockInput}
                  onChange={e => setStockInput(e.target.value)}
                  className="flex-1 border border-black/15 bg-transparent px-3 py-2"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => act("set_stock", { stock: Number(stockInput) })}
                  className="bg-black px-4 py-2 text-xs uppercase tracking-wider text-white"
                >
                  Set stock
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ActionBtn onClick={() => act("clear_holds")}>Сбросить holds</ActionBtn>
                <ActionBtn
                  onClick={() =>
                    act("set_starts_at", { startsAt: new Date(Date.now() + 3600_000).toISOString() })
                  }
                >
                  Pre-drop +1ч
                </ActionBtn>
                <ActionBtn
                  onClick={() => act("set_starts_at", { startsAt: "2020-01-01T00:00:00.000Z" })}
                >
                  Active now
                </ActionBtn>
                <ActionBtn onClick={() => act("reset_demo")} accent>
                  Reset demo
                </ActionBtn>
              </div>
            </Section>

            <Section title="Темы в слайдере (9)">
              <ul className="space-y-2 text-sm">
                {DROP_THEMES.map((t, i) => (
                  <li key={t.id} className="flex items-center justify-between border-b border-black/5 py-2">
                    <div>
                      <span className="text-xs text-[var(--muted)]">#{i + 1}</span>{" "}
                      <span className="font-medium">{t.name}</span>
                      <p className="text-xs text-[var(--muted)]">
                        {t.edition} · {formatPrice(t.price)}
                      </p>
                    </div>
                    <span className="text-xs uppercase text-emerald-700">В дропе</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--muted)]">
                VIP-пароль: {DROP_CONFIG.vipPassword} · Редактирование GLB — в Content
              </p>
            </Section>
          </div>
        )}

        {data && tab === "orders" && (
          <Section title={`Заказы (${filteredOrders.length})`}>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["all", "paid", "pending", "failed", "refunded"] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOrderStatus(s)}
                  className={`px-2 py-1 text-xs uppercase ${
                    orderStatus === s ? "bg-black text-white" : "border border-black/15"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              value={orderQuery}
              onChange={e => setOrderQuery(e.target.value)}
              placeholder="Поиск: телефон, имя, чек"
              className="mb-4 w-full border border-black/15 bg-transparent px-3 py-2 text-sm"
            />
            <OrderList
              orders={filteredOrders}
              onConfirm={id => act("confirm_pending", { orderId: id })}
              onRefund={id => act("mark_order", { orderId: id, status: "refunded" })}
            />
            <button
              type="button"
              onClick={() => exportOrdersCsv(filteredOrders)}
              className="mt-4 text-xs uppercase tracking-wider underline"
            >
              Экспорт CSV
            </button>
          </Section>
        )}

        {data && tab === "customers" && (
          <Section title={`Покупатели (${customers.length})`}>
            <ul className="space-y-3 text-sm">
              {customers.map(c => (
                <li key={c.phone} className="border-b border-black/5 pb-3">
                  <p className="font-medium">{c.name || "—"}</p>
                  <p className="text-xs text-[var(--muted)]">{c.phone}</p>
                  <p className="mt-1 text-xs">
                    {c.orders} заказов · LTV {formatPrice(c.ltv)}
                  </p>
                </li>
              ))}
              {customers.length === 0 && (
                <p className="text-[var(--muted)]">Пока нет покупателей</p>
              )}
            </ul>
          </Section>
        )}

        {data && tab === "stock" && (
          <div className="space-y-6">
            <Section title="Live stock">
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="border border-black/10 p-3">
                  <p className="text-2xl font-semibold">{data.available}</p>
                  <p className="text-xs text-[var(--muted)]">available</p>
                </div>
                <div className="border border-black/10 p-3">
                  <p className="text-2xl font-semibold">{data.holds.length}</p>
                  <p className="text-xs text-[var(--muted)]">held</p>
                </div>
                <div className="border border-black/10 p-3">
                  <p className="text-2xl font-semibold">
                    {data.totalStock - data.stock}
                  </p>
                  <p className="text-xs text-[var(--muted)]">sold</p>
                </div>
              </div>
            </Section>
            <Section title={`Активные holds (${data.holds.length})`}>
              {data.holds.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Нет активных</p>
              ) : (
                <ul className="space-y-1 font-mono text-xs">
                  {data.holds.map(h => (
                    <li key={h.id}>
                      {h.id.slice(0, 8)}… истекает {new Date(h.expiresAt).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              )}
              <ActionBtn className="mt-3" onClick={() => act("clear_holds")}>
                Очистить истёкшие / все holds
              </ActionBtn>
            </Section>
          </div>
        )}

        {data && tab === "waitlist" && (
          <Section title={`Waitlist (${data.waitlist.length})`}>
            <ul className="space-y-1 text-sm">
              {data.waitlist.map(w => (
                <li key={w.id}>{w.contact}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => exportWaitlistCsv(data.waitlist.map(w => w.contact))}
              className="mt-4 text-xs uppercase tracking-wider underline"
            >
              Экспорт CSV
            </button>
            <button
              type="button"
              onClick={() => {
                const count = data.waitlist.length;
                window.alert(`Mock: SMS «Дроп через 1 час» отправлено ${count} контактам`);
              }}
              className="mt-4 border border-black/15 px-3 py-2 text-xs uppercase tracking-wider"
            >
              Рассылка (mock)
            </button>
            <p className="mt-3 text-xs text-[var(--muted)]">
              Рассылка «Дроп через 1 час» — подключите SMS/Telegram в продакшене
            </p>
          </Section>
        )}

        {data && tab === "analytics" && (
          <div className="space-y-6">
            <Section title="Воронка">
              <FunnelRow label="Просмотр дропа" value={String(analytics.dropViews)} />
              <FunnelRow label="Buy Now" value={String(analytics.buyNowClicks)} />
              <FunnelRow label="Checkout opened" value={String(analytics.checkoutOpens)} />
              <FunnelRow label="Hold создан" value={String(analytics.checkoutHolds)} />
              <FunnelRow label="Оплачено" value={String(analytics.checkoutPaid)} />
            </Section>
            <Section title="Ошибки checkout">
              <FunnelRow label="Hold expired" value={String(analytics.holdExpired)} />
              <FunnelRow label="Race lost" value={String(analytics.raceLost)} />
              <FunnelRow label="Payment failed" value={String(analytics.checkoutFailed)} />
            </Section>
            <button
              type="button"
              onClick={() => resetAnalytics()}
              className="text-xs uppercase tracking-wider underline"
            >
              Сбросить аналитику
            </button>
            <Section title="По товарам">
              <ProductBreakdown orders={data.orders} />
            </Section>
          </div>
        )}

        {tab === "content" && (
          <Section title="Контент и витрина">
            <ul className="space-y-2 text-sm">
              {DROP_THEMES.map(t => (
                <li key={t.id} className="border-b border-black/5 py-2">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-[var(--muted)]">{t.tagline}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Legal: <a href="/legal/offer" className="underline">оферта</a>,{" "}
              <a href="/legal/delivery" className="underline">доставка</a>,{" "}
              <a href="/legal/refund" className="underline">возврат</a>,{" "}
              <a href="/legal/privacy" className="underline">privacy</a>
            </p>
          </Section>
        )}

        {data && tab === "payments" && (
          <Section title="Paylov">
            <p className="text-sm">
              Статус интеграции: <span className="font-medium text-emerald-700">Mock OK</span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Режим: демо · Webhook не подключён
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {data.orders.slice(0, 10).map(o => (
                <li key={o.id} className="flex justify-between border-b border-black/5 py-2">
                  <span>{o.receipt}</span>
                  <span className="text-xs uppercase">{o.status}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {tab === "settings" && (
          <Section title="Настройки магазина">
            <dl className="space-y-3 text-sm">
              <Row label="Название" value="The4" />
              <Row label="Валюта" value={DROP_CONFIG.currency} />
              <Row label="Hold time" value={`${DROP_CONFIG.holdMinutes} мин`} />
              <Row label="Самовывоз" value={DROP_CONFIG.pickupAddress} />
              <Row label="Admin-пароль" value="THE4ADMIN (mock)" />
            </dl>
          </Section>
        )}

        {tab === "team" && (
          <Section title="Команда">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-black/5 py-2">
                <span>Owner</span>
                <span className="text-[var(--muted)]">полный доступ</span>
              </li>
              <li className="flex justify-between border-b border-black/5 py-2">
                <span>Manager</span>
                <span className="text-[var(--muted)]">дроп + заказы</span>
              </li>
              <li className="flex justify-between border-b border-black/5 py-2">
                <span>Support</span>
                <span className="text-[var(--muted)]">read-only</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Роли и 2FA — при переходе на Supabase Auth
            </p>
          </Section>
        )}
      </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-black/10 bg-white p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-black/45">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  accent,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border border-black/15 px-3 py-2 text-xs uppercase ${
        accent ? "text-[var(--accent)]" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

function OrderList({
  orders,
  onConfirm,
  onRefund,
}: {
  orders: Order[];
  onConfirm: (id: number) => void;
  onRefund: (id: number) => void;
}) {
  return (
    <ul className="max-h-96 space-y-2 overflow-y-auto text-sm">
      {orders.map(o => (
        <li key={o.id} className="flex items-center justify-between gap-2 border-b border-black/5 pb-2">
          <div>
            <a href={`/order/${o.id}`} className="font-medium underline">
              {o.receipt}
            </a>
            <p className="text-xs text-[var(--muted)]">
              {o.buyer.name} · {o.buyer.phone}
            </p>
            {o.productName && (
              <p className="text-xs text-[var(--muted)]">{o.productName}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase">{o.status}</p>
            <p className="text-xs">{formatPrice(o.amount)}</p>
            {o.status === "pending" && (
              <button
                type="button"
                onClick={() => onConfirm(o.id)}
                className="mt-1 text-[0.6rem] uppercase underline"
              >
                Confirm
              </button>
            )}
            {o.status === "paid" && (
              <button
                type="button"
                onClick={() => onRefund(o.id)}
                className="mt-1 text-[0.6rem] uppercase underline text-amber-800"
              >
                Refund
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function FunnelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-black/5 py-2 text-sm">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function ProductBreakdown({ orders }: { orders: Order[] }) {
  const counts = new Map<string, number>();
  for (const o of orders.filter(x => x.status === "paid")) {
    const key = o.productName || DROP_CONFIG.name;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!entries.length) return <p className="text-sm text-[var(--muted)]">Нет оплаченных заказов</p>;
  return (
    <ul className="space-y-1 text-sm">
      {entries.map(([name, n]) => (
        <li key={name} className="flex justify-between">
          <span>{name}</span>
          <span>{n}</span>
        </li>
      ))}
    </ul>
  );
}

function computeMetrics(data: AdminSnapshot | null) {
  if (!data) {
    return {
      todayOrders: 0,
      todayRevenue: 0,
      conversion: 0,
      phase: "—",
      alerts: [] as string[],
      checkoutStarted: 0,
      paidOrders: 0,
      failedOrders: 0,
    };
  }

  const today = new Date().toDateString();
  const todayOrders = data.orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todayRevenue = todayOrders
    .filter(o => o.status === "paid")
    .reduce((s, o) => s + o.amount, 0);
  const paid = data.orders.filter(o => o.status === "paid").length;
  const failed = data.orders.filter(o => o.status === "failed").length;
  const started = data.orders.length;
  const conversion = started ? Math.round((paid / started) * 100) : 0;

  const alerts: string[] = [];
  if (data.available <= 3 && data.stock > 0) alerts.push("Мало стока — осталось мало доступных");
  if (failed >= 3) alerts.push("Много failed оплат — проверьте Paylov");

  const phase =
    data.stock <= 0
      ? "Sold out"
      : Date.now() < new Date(data.startsAt).getTime()
        ? "Pre-drop"
        : "Active";

  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    conversion,
    phase,
    alerts,
    checkoutStarted: started,
    paidOrders: paid,
    failedOrders: failed,
  };
}

function buildCustomers(orders: Order[]) {
  const map = new Map<string, { phone: string; name: string; orders: number; ltv: number }>();
  for (const o of orders) {
    const key = o.buyer.phone.replace(/\D/g, "");
    const cur = map.get(key) ?? { phone: o.buyer.phone, name: o.buyer.name, orders: 0, ltv: 0 };
    cur.orders += 1;
    if (o.status === "paid") cur.ltv += o.amount;
    if (!cur.name && o.buyer.name) cur.name = o.buyer.name;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.ltv - a.ltv);
}

function exportOrdersCsv(orders: Order[]) {
  const header = "receipt,status,name,phone,amount,product,date\n";
  const rows = orders
    .map(
      o =>
        `${o.receipt},${o.status},"${o.buyer.name}",${o.buyer.phone},${o.amount},"${o.productName || ""}",${o.createdAt}`,
    )
    .join("\n");
  downloadCsv(header + rows, "the4-orders.csv");
}

function exportWaitlistCsv(contacts: string[]) {
  const body = "contact\n" + contacts.map(c => `"${c}"`).join("\n");
  downloadCsv(body, "the4-waitlist.csv");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
