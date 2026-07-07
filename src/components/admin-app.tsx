"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminAction,
  adminFetch,
  adminLogin,
  type AdminSnapshot,
} from "@/lib/api";
import { formatPrice } from "@/lib/format";

const TOKEN_KEY = "the4_admin_token";

export function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AdminSnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockInput, setStockInput] = useState("14");

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
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setData(null);
  };

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
    <main className="min-h-[100dvh] bg-[#f0efeb] px-4 py-6 pb-20 text-[var(--fg)]">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <h1 className="text-lg font-semibold">Admin</h1>
        <button type="button" onClick={logout} className="text-xs uppercase tracking-widest underline">
          Выйти
        </button>
      </div>

      {error && <p className="mx-auto mt-4 max-w-lg text-sm text-red-600">{error}</p>}

      {data && (
        <div className="mx-auto mt-8 max-w-lg space-y-6">
          <section className="border border-black/10 bg-white/50 p-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Stock</h2>
            <p className="mt-2 text-2xl font-semibold">
              {data.available} доступно / {data.stock} на складе / {data.totalStock} всего
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
                Set
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0, 1, 14].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => act("set_stock", { stock: n })}
                  className="border border-black/15 px-3 py-1 text-xs"
                >
                  {n === 0 ? "Sold out" : n}
                </button>
              ))}
            </div>
          </section>

          <section className="border border-black/10 bg-white/50 p-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Drop</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => act("set_paused", { paused: !data.paused })}
                className="border border-black/15 px-3 py-2 text-xs uppercase"
              >
                {data.paused ? "Снять паузу" : "Пауза"}
              </button>
              <button
                type="button"
                onClick={() => act("clear_holds")}
                className="border border-black/15 px-3 py-2 text-xs uppercase"
              >
                Сбросить holds
              </button>
              <button
                type="button"
                onClick={() =>
                  act("set_starts_at", {
                    startsAt: new Date(Date.now() + 3600_000).toISOString(),
                  })
                }
                className="border border-black/15 px-3 py-2 text-xs uppercase"
              >
                Pre-drop +1ч
              </button>
              <button
                type="button"
                onClick={() => act("set_starts_at", { startsAt: "2020-01-01T00:00:00.000Z" })}
                className="border border-black/15 px-3 py-2 text-xs uppercase"
              >
                Active now
              </button>
              <button
                type="button"
                onClick={() => act("reset_demo")}
                className="border border-black/15 px-3 py-2 text-xs uppercase text-[var(--accent)]"
              >
                Reset demo
              </button>
            </div>
          </section>

          <section className="border border-black/10 bg-white/50 p-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Holds ({data.holds.length})
            </h2>
            {data.holds.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)]">Нет активных</p>
            ) : (
              <ul className="mt-2 space-y-1 text-xs font-mono">
                {data.holds.map(h => (
                  <li key={h.id}>
                    {h.id.slice(0, 8)}… до {new Date(h.expiresAt).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-black/10 bg-white/50 p-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Orders ({data.orders.length})
            </h2>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
              {data.orders.map(o => (
                <li key={o.id} className="flex items-center justify-between gap-2 border-b border-black/5 pb-2">
                  <div>
                    <a href={`/order/${o.id}`} className="font-medium underline">
                      {o.receipt}
                    </a>
                    <p className="text-xs text-[var(--muted)]">{o.buyer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase">{o.status}</p>
                    <p className="text-xs">{formatPrice(o.amount)}</p>
                    {o.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => act("confirm_pending", { orderId: o.id })}
                        className="mt-1 text-[0.6rem] uppercase underline"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-black/10 bg-white/50 p-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Waitlist ({data.waitlist.length})
            </h2>
            <ul className="mt-2 space-y-1 text-sm">
              {data.waitlist.map(w => (
                <li key={w.id}>{w.contact}</li>
              ))}
            </ul>
          </section>

          <section className="border border-black/10 bg-white/50 p-4 text-sm">
            <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Экраны</h2>
            <ul className="mt-3 space-y-2 text-xs uppercase tracking-wider">
              <li>
                <a href="/" className="underline">
                  Active drop
                </a>
              </li>
              <li>
                <a href="/home" className="underline">
                  Home / Archive
                </a>
              </li>
              <li className="text-[var(--muted)]">
                Checkout: Paylov=success, Apple=pending, Google=fail
              </li>
              <li className="text-[var(--muted)]">
                Hold expired: жди 5 мин в checkout или уменьши hold в коде
              </li>
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
