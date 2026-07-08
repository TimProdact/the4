"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import type { Order, OrderStatus } from "@/lib/types";
import { fetchOrder } from "@/lib/api";
import { DROP_CONFIG } from "@/lib/drop-config";
import { formatPhoneUz, formatPrice, formatDate, isValidPhoneUz } from "@/lib/format";
import { useProfile } from "@/lib/profile-context";
import type { CatPersona } from "@/lib/cat-username";
import { CatAvatar } from "./cat-avatar";
import { OrderReceiptContent } from "./order-receipt-screen";
import {
  deleteAddress,
  getAddresses,
  getDefaultAddress,
  getOrdersForUser,
  getProfile,
  logoutProfile,
  saveAddress,
  sendOtpMock,
  setProfileName,
  updateProfileSettings,
  verifyOtpMock,
  type SavedAddress,
} from "@/lib/profile-store";
import { LOCALE_LABELS, setStoredLocale, useT, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n/messages";
import { getStoredLocale } from "@/lib/i18n/locale-storage";

type View =
  | "home"
  | "auth-phone"
  | "auth-otp"
  | "auth-name"
  | "orders"
  | "addresses"
  | "address-form"
  | "settings"
  | "order";

type OrderFilter = "all" | "active";

interface ProfileSheetProps {
  mode?: "sheet" | "page";
}

export function ProfileSheet({ mode = "sheet" }: ProfileSheetProps) {
  const router = useRouter();
  const { t, locale, translateError, setLocale } = useT();
  const { open, closeProfile, user, persona, refreshUser, entry } = useProfile();
  const [view, setView] = useState<View>("home");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [phone, setPhone] = useState("+998 ");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addrForm, setAddrForm] = useState({
    city: t("profile.defaultCity"),
    street: "",
    house: "",
    apt: "",
    comment: "",
    isDefault: false,
  });

  const visible = mode === "page" || open;

  const wasVisible = useRef(false);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!visible) return;
    if (justOpened) {
      if (entry.type === "order" && entry.orderId) {
        setSelectedOrderId(entry.orderId);
        setView("order");
      } else {
        setSelectedOrderId(null);
        setSelectedOrder(null);
        setView("home");
      }
      setError("");
    }
    setAddresses(getAddresses());
  }, [visible, user?.phone, entry]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn(v => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (view !== "order" || !selectedOrderId) {
      setSelectedOrder(null);
      return;
    }
    let cancelled = false;
    fetchOrder(selectedOrderId)
      .then(order => {
        if (!cancelled) setSelectedOrder(order);
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? translateError(e.message) : t("errors.orderNotFound"));
      });
    return () => {
      cancelled = true;
    };
  }, [view, selectedOrderId]);

  const orders = useMemo(() => {
    if (!user) return [];
    const list = getOrdersForUser(user.phone);
    if (orderFilter === "all") return list;
    return list.filter(o => o.status === "paid" || o.status === "pending");
  }, [user, orderFilter, view]);

  if (!visible) return null;

  const close = () => {
    if (mode === "page") router.push("/");
    else closeProfile();
  };

  const goHome = () => {
    setView("home");
    setError("");
  };

  const goBack = () => {
    setError("");
    if (view === "order") {
      setSelectedOrderId(null);
      setSelectedOrder(null);
      setView("orders");
      return;
    }
    if (view === "address-form") setView("addresses");
    else if (view === "auth-otp") setView("auth-phone");
    else if (view === "auth-name") setView("auth-otp");
    else if (view === "orders" || view === "addresses" || view === "settings") goHome();
    else goHome();
  };

  const openOrder = (orderId: number) => {
    setError("");
    setSelectedOrderId(orderId);
    setView("order");
  };

  const sendOtp = () => {
    setError("");
    try {
      sendOtpMock(phone);
      setResendIn(45);
      setView("auth-otp");
    } catch (e) {
      setError(e instanceof Error ? translateError(e.message) : t("common.error"));
    }
  };

  const verifyOtp = () => {
    setError("");
    try {
      const result = verifyOtpMock(otp);
      refreshUser();
      if (result.needsName) {
        setName("");
        setView("auth-name");
      } else {
        goHome();
      }
    } catch (e) {
      setError(e instanceof Error ? translateError(e.message) : t("common.error"));
    }
  };

  const saveName = () => {
    if (!name.trim()) {
      setError(t("profile.enterName"));
      return;
    }
    setProfileName(name);
    refreshUser();
    goHome();
  };

  const openAddressForm = (addr?: SavedAddress) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrForm({
        city: addr.city,
        street: addr.street,
        house: addr.house,
        apt: addr.apt,
        comment: addr.comment,
        isDefault: addr.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddrForm({
        city: t("profile.defaultCity"),
        street: "",
        house: "",
        apt: "",
        comment: "",
        isDefault: addresses.length === 0,
      });
    }
    setView("address-form");
  };

  const submitAddress = () => {
    if (!addrForm.street.trim() || !addrForm.house.trim()) {
      setError(t("profile.streetHouseRequired"));
      return;
    }
    saveAddress({
      id: editingAddress?.id,
      ...addrForm,
    });
    setAddresses(getAddresses());
    setView("addresses");
    setError("");
  };

  const shell = (
    <div
      className={
        mode === "sheet"
          ? "fixed inset-0 z-[80] flex flex-col bg-[var(--bg)] text-[var(--fg)]"
          : "min-h-[100dvh] bg-[var(--bg)]"
      }
    >
      <div className="flex min-h-[100dvh] w-full flex-col">
        <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 border-b border-[var(--fg)]/10 px-5 py-4">
          <div className="justify-self-start">
            {view !== "home" ? (
              <button
                type="button"
                onClick={goBack}
                className="text-xs uppercase tracking-widest text-[var(--muted)]"
              >
                ←
              </button>
            ) : mode === "page" ? (
              <Link href="/" className="text-xs uppercase tracking-widest text-[var(--muted)]">
                ←
              </Link>
            ) : (
              <span aria-hidden className="block w-6" />
            )}
          </div>
          <h1 className="text-center text-sm font-semibold uppercase tracking-[0.15em]">
            {viewTitle(view, t)}
          </h1>
          <div className="justify-self-end">
            {mode === "sheet" ? (
              <button
                type="button"
                onClick={close}
                aria-label={t("common.close")}
                className="text-xl leading-none text-[var(--muted)]"
              >
                ×
              </button>
            ) : (
              <span aria-hidden className="block w-6" />
            )}
          </div>
        </header>

        <div
          className={`relative flex-1 overflow-hidden ${
            mode === "sheet" ? "mx-auto w-full max-w-lg" : "w-full"
          }`}
        >
          <div
            className="h-full overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            aria-hidden={view !== "home"}
          >
            <HomeView
              user={user}
              persona={persona}
              currentLocale={locale}
              onLocaleChange={next => {
                setStoredLocale(next);
                setLocale(next);
              }}
              onLogin={() => {
                setPhone(user?.phone ? formatPhoneUz(user.phone) : "+998 ");
                setView("auth-phone");
              }}
              onNavigate={setView}
            />
          </div>

          {view !== "home" && (
            <div className="absolute inset-0 z-10 flex animate-slide-up flex-col bg-[var(--bg)]">
              <div className="flex-1 overflow-y-auto px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {error && !view.startsWith("auth-") && (
                  <p className="mb-4 border border-[var(--accent)]/30 bg-[var(--state-error-bg)] px-4 py-3 text-sm text-[var(--accent)]">
                    {error}
                  </p>
                )}

                {view === "auth-phone" && (
                  <div className="mt-4 space-y-4">
                    <p className="text-center text-sm text-[var(--muted)]">
                      {t("profile.authPhoneHint")}
                    </p>
                    <input
                      type="tel"
                      autoFocus
                      value={phone}
                      onChange={e => setPhone(formatPhoneUz(e.target.value))}
                      className="w-full border-b border-[var(--fg)]/20 bg-transparent py-3 text-lg outline-none"
                      placeholder="+998 90 123 45 67"
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={!isValidPhoneUz(phone)}
                      className="w-full bg-[var(--btn)] py-3 text-sm font-semibold uppercase tracking-widest text-[var(--btn-text)] disabled:opacity-40"
                    >
                      {t("profile.getCode")}
                    </button>
                    <p className="text-center text-xs uppercase tracking-widest text-[var(--muted)]">
                      {t("profile.demoOtp")}
                    </p>
                    {error && (
                      <p className="text-center text-sm text-[var(--state-error)]">{error}</p>
                    )}
                  </div>
                )}

                {view === "auth-otp" && (
                  <div className="mt-4 space-y-4">
                    <p className="text-center text-sm text-[var(--muted)]">
                      {t("profile.authOtpHint", { phone })}
                    </p>
                    <input
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full border-b border-[var(--fg)]/20 bg-transparent py-3 text-center text-2xl tracking-[0.4em] outline-none"
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otp.length < 4}
                      className="w-full bg-[var(--btn)] py-3 text-sm font-semibold uppercase tracking-widest text-[var(--btn-text)] disabled:opacity-40"
                    >
                      {t("profile.confirm")}
                    </button>
                    <button
                      type="button"
                      disabled={resendIn > 0}
                      onClick={sendOtp}
                      className="w-full text-xs uppercase tracking-widest text-[var(--muted)] disabled:opacity-40"
                    >
                      {resendIn > 0
                        ? t("profile.resendIn", { seconds: resendIn })
                        : t("profile.resend")}
                    </button>
                    {error && (
                      <p className="text-center text-sm text-[var(--state-error)]">{error}</p>
                    )}
                  </div>
                )}

                {view === "auth-name" && (
                  <div className="mt-4 space-y-4">
                    <p className="text-center text-sm text-[var(--muted)]">{t("profile.authNameHint")}</p>
                    <input
                      autoFocus
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full border-b border-[var(--fg)]/20 bg-transparent py-3 text-lg outline-none"
                      placeholder={t("profile.yourName")}
                      autoComplete="name"
                    />
                    <button
                      type="button"
                      onClick={saveName}
                      className="w-full bg-[var(--btn)] py-3 text-sm font-semibold uppercase tracking-widest text-[var(--btn-text)]"
                    >
                      {t("common.save")}
                    </button>
                    {error && (
                      <p className="text-center text-sm text-[var(--state-error)]">{error}</p>
                    )}
                  </div>
                )}

          {view === "orders" && (
            <OrdersView
              user={user}
              orders={orders}
              filter={orderFilter}
              onFilter={setOrderFilter}
              onOpenOrder={openOrder}
            />
          )}

          {view === "addresses" && (
            <AddressesView
              user={user}
              addresses={addresses}
              onAdd={() => openAddressForm()}
              onEdit={openAddressForm}
              onDelete={id => {
                deleteAddress(id);
                setAddresses(getAddresses());
              }}
            />
          )}

          {view === "address-form" && (
            <AddressFormView
              form={addrForm}
              onChange={patch => setAddrForm(f => ({ ...f, ...patch }))}
              onSave={submitAddress}
            />
          )}

          {view === "settings" && user && (
            <SettingsView
              user={user}
              onUpdate={patch => {
                updateProfileSettings(patch);
                if (patch.locale) setLocale(patch.locale);
                refreshUser();
              }}
              onLogout={() => {
                logoutProfile();
                refreshUser();
                goHome();
              }}
            />
          )}

          {view === "order" && (
            <>
              {!selectedOrder ? (
                <div className="flex justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--fg)]/15 border-t-[var(--fg)]" />
                </div>
              ) : (
                <OrderReceiptContent order={selectedOrder} embedded />
              )}
            </>
          )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return shell;
}

function viewTitle(view: View, t: (key: string) => string): string {
  const titles: Record<View, string> = {
    home: t("profile.title"),
    "auth-phone": t("profile.authPhone"),
    "auth-otp": t("profile.authOtp"),
    "auth-name": t("profile.authName"),
    orders: t("profile.orders"),
    addresses: t("profile.addresses"),
    "address-form": t("profile.addressForm"),
    settings: t("profile.settings"),
    order: t("profile.receipt"),
  };
  return titles[view];
}

function ProfileSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {title}
      </p>
      {hint && <p className="mb-3 text-sm text-[var(--muted)]">{hint}</p>}
      {children}
    </section>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  center,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  center?: boolean;
}) {
  return (
    <label className="block border border-[var(--fg)]/10 px-4 py-3">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-2 w-full bg-transparent font-medium outline-none placeholder:text-[var(--muted)] ${
          center ? "text-center text-xl tracking-[0.35em]" : ""
        }`}
      />
    </label>
  );
}

function ProfilePrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-[var(--btn)] py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--btn-text)] transition active:scale-[0.99] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ProfileTextButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2 text-[0.65rem] uppercase tracking-[0.16em] text-[var(--muted)] underline underline-offset-4 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ProfileSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="flex rounded-full border border-[var(--fg)]/10 p-0.5"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded-full py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition ${
            value === o.id ? "bg-[var(--btn)] text-[var(--btn-text)]" : "text-[var(--muted)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ProfileToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between border border-[var(--fg)]/10 px-4 py-4">
      <span className="font-medium">{label}</span>
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border transition ${
          checked
            ? "border-[var(--btn)] bg-[var(--btn)] text-[var(--btn-text)]"
            : "border-[var(--fg)]/20 bg-transparent"
        }`}
        aria-hidden
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="m6 12.5 3.5 3.5L18 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}

function HomeView({
  user,
  persona,
  onLogin,
  onNavigate,
  onLocaleChange,
  currentLocale,
}: {
  user: ReturnType<typeof useProfile>["user"];
  persona: CatPersona;
  onLogin: () => void;
  onNavigate: (v: View) => void;
  onLocaleChange: (locale: Locale) => void;
  currentLocale: Locale;
}) {
  const { t } = useT();
  const locales = (["ru", "uz", "en"] as const).map(id => ({ id, label: LOCALE_LABELS[id] }));

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col items-center pt-2 text-center">
        <CatAvatar avatarId={persona.avatarId} size="lg" unknown={!user} />
        <p className="mt-4 text-lg font-semibold">{persona.username}</p>
        {user ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{formatPhoneUz(user.phone)}</p>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="mt-1 text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
          >
            {t("profile.login")}
          </button>
        )}
      </div>

      {!user && (
        <div className="mt-8">
          <ProfileSection title={t("profile.language")}>
            <ProfileSegmentedControl
              ariaLabel={t("locale.aria")}
              options={locales}
              value={currentLocale}
              onChange={onLocaleChange}
            />
          </ProfileSection>
        </div>
      )}

      <div className="mt-8 space-y-2">
        <MenuBlock
          title={t("profile.myOrders")}
          locked={!user}
          lockedHint={t("profile.loginToSee")}
          onClick={() => onNavigate("orders")}
          onLockedClick={onLogin}
        />
        {user && (
          <>
            <ActionRow label={t("profile.addresses")} onClick={() => onNavigate("addresses")} />
            <ActionRow label={t("profile.settingsNav")} onClick={() => onNavigate("settings")} />
          </>
        )}
      </div>

      <ProfileFooter />
    </div>
  );
}

function MenuBlock({
  title,
  onClick,
  locked,
  lockedHint,
  onLockedClick,
}: {
  title: string;
  onClick?: () => void;
  locked?: boolean;
  lockedHint?: string;
  onLockedClick?: () => void;
}) {
  if (locked) {
    return (
      <button
        type="button"
        onClick={onLockedClick}
        className="flex w-full items-center justify-between border border-[var(--fg)]/10 px-4 py-4 text-left opacity-60 transition hover:opacity-80 active:scale-[0.99]"
      >
        <span className="font-medium">{title}</span>
        <span className="text-xs text-[var(--muted)] underline underline-offset-2">{lockedHint}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border border-[var(--fg)]/10 px-4 py-4 text-left"
    >
      <span className="font-medium">{title}</span>
      <span className="text-[var(--muted)]">→</span>
    </button>
  );
}

function ActionRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border border-[var(--fg)]/10 px-4 py-4 text-left"
    >
      <span className="font-medium">{label}</span>
      <span className="text-[var(--muted)]">→</span>
    </button>
  );
}

function ProfileFooter() {
  const { t } = useT();
  const legal = [
    { href: "/legal/offer", label: t("profile.legalOffer") },
    { href: "/legal/delivery", label: t("profile.legalDelivery") },
    { href: "/legal/refund", label: t("profile.legalRefund") },
    { href: "/legal/privacy", label: t("profile.legalPrivacy") },
  ];

  const linkClass = "underline underline-offset-4";

  return (
    <footer className="mt-auto pt-12 text-center text-[0.65rem] uppercase tracking-[0.15em] text-[var(--muted)]">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {legal.map(l => (
          <Link key={l.href} href={l.href} className={linkClass}>
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

function OrdersView({
  user,
  orders,
  filter,
  onFilter,
  onOpenOrder,
}: {
  user: ReturnType<typeof useProfile>["user"];
  orders: Order[];
  filter: OrderFilter;
  onFilter: (f: OrderFilter) => void;
  onOpenOrder: (orderId: number) => void;
}) {
  const { t, locale } = useT();

  const STATUS_LABEL: Record<OrderStatus, string> = {
    paid: t("orderStatus.paid"),
    pending: t("orderStatus.pendingShort"),
    failed: t("orderStatus.failedShort"),
    refunded: t("orderStatus.refunded"),
  };

  const STATUS_CLASS: Record<OrderStatus, string> = {
    paid: "bg-emerald-500/15 text-emerald-700",
    pending: "bg-amber-500/15 text-amber-800",
    failed: "bg-red-500/15 text-red-700",
    refunded: "bg-black/10 text-[var(--muted)]",
  };

  if (!user) {
    return (
      <div className="border border-[var(--fg)]/10 px-4 py-8 text-center text-sm text-[var(--muted)]">
        {t("profile.loginForOrders")}
      </div>
    );
  }

  const filters: { id: OrderFilter; label: string }[] = [
    { id: "all", label: t("profile.filterAll") },
    { id: "active", label: t("profile.filterActive") },
  ];

  return (
    <div className="space-y-6">
      <ProfileSection title={t("profile.filter")}>
        <ProfileSegmentedControl
          ariaLabel={t("profile.filterAria")}
          options={filters}
          value={filter}
          onChange={onFilter}
        />
      </ProfileSection>

      {orders.length === 0 ? (
        <div className="border border-[var(--fg)]/10 px-4 py-10 text-center">
          <p className="text-sm text-[var(--muted)]">{t("profile.noOrders")}</p>
          <Link
            href={asset("/")}
            className="mt-4 inline-block border border-[var(--fg)]/10 px-6 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em]"
          >
            {t("profile.toDrop")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {orders.map(o => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => onOpenOrder(o.id)}
                className="block w-full border border-[var(--fg)]/10 px-4 py-4 text-left transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{o.receipt}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {o.productName || DROP_CONFIG.name}
                    </p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">
                      {formatDate(o.createdAt, locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${STATUS_CLASS[o.status]}`}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                    <p className="mt-2 text-sm font-medium">{formatPrice(o.amount, "UZS", locale)}</p>
                    <span className="mt-2 block text-[var(--muted)]">→</span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddressesView({
  user,
  addresses,
  onAdd,
  onEdit,
  onDelete,
}: {
  user: ReturnType<typeof useProfile>["user"];
  addresses: SavedAddress[];
  onAdd: () => void;
  onEdit: (a: SavedAddress) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useT();

  if (!user) {
    return (
      <div className="border border-[var(--fg)]/10 px-4 py-8 text-center text-sm text-[var(--muted)]">
        {t("profile.loginForAddresses")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileSection title={t("profile.pickup")}>
        <div className="border border-[var(--fg)]/10 px-4 py-4">
          <p className="font-medium">{DROP_CONFIG.pickupAddress}</p>
        </div>
      </ProfileSection>

      <ProfileSection title={t("profile.delivery")}>
        <div className="space-y-2">
          {addresses.map(a => (
            <div key={a.id} className="border border-[var(--fg)]/10 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {a.isDefault && (
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      {t("profile.defaultAddress")}
                    </p>
                  )}
                  <p className="mt-1 font-medium">
                    {a.city}, {a.street}, {a.house}
                    {a.apt ? `, ${t("profile.aptSuffix", { apt: a.apt })}` : ""}
                  </p>
                  {a.comment && (
                    <p className="mt-1 text-sm text-[var(--muted)]">{a.comment}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => onEdit(a)}
                    className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)] underline underline-offset-2"
                  >
                    {t("profile.editShort")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(a.id)}
                    className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--accent)] underline underline-offset-2"
                  >
                    {t("profile.deleteShort")}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="w-full border border-dashed border-[var(--fg)]/20 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] transition active:scale-[0.99]"
          >
            {t("profile.addAddress")}
          </button>
        </div>
      </ProfileSection>
    </div>
  );
}

function AddressFormView({
  form,
  onChange,
  onSave,
}: {
  form: {
    city: string;
    street: string;
    house: string;
    apt: string;
    comment: string;
    isDefault: boolean;
  };
  onChange: (patch: Partial<typeof form>) => void;
  onSave: () => void;
}) {
  const { t } = useT();

  return (
    <div className="space-y-6">
      <ProfileSection title={t("profile.addressSection")}>
        <div className="space-y-2">
          <ProfileField label={t("profile.city")} value={form.city} onChange={v => onChange({ city: v })} />
          <ProfileField label={t("profile.street")} value={form.street} onChange={v => onChange({ street: v })} />
          <ProfileField label={t("profile.house")} value={form.house} onChange={v => onChange({ house: v })} />
          <ProfileField
            label={t("profile.apt")}
            value={form.apt}
            onChange={v => onChange({ apt: v })}
            placeholder={t("profile.aptOptional")}
          />
          <ProfileField
            label={t("profile.comment")}
            value={form.comment}
            onChange={v => onChange({ comment: v })}
            placeholder={t("profile.commentPlaceholder")}
          />
        </div>
      </ProfileSection>

      <ProfileToggle
        label={t("profile.defaultAddressToggle")}
        checked={form.isDefault}
        onChange={isDefault => onChange({ isDefault })}
      />

      <ProfilePrimaryButton onClick={onSave}>{t("common.save")}</ProfilePrimaryButton>
    </div>
  );
}

function SettingsView({
  user,
  onUpdate,
  onLogout,
}: {
  user: NonNullable<ReturnType<typeof useProfile>["user"]>;
  onUpdate: (patch: {
    notifyDrop?: boolean;
    notifyOrders?: boolean;
    locale?: Locale;
  }) => void;
  onLogout: () => void;
}) {
  const { t } = useT();
  const locales = (["ru", "uz", "en"] as const).map(id => ({ id, label: LOCALE_LABELS[id] }));
  const locale = user.locale ?? "ru";

  return (
    <div className="space-y-8">
      <ProfileSection title={t("profile.language")}>
        <ProfileSegmentedControl
          ariaLabel={t("locale.aria")}
          options={locales}
          value={locale}
          onChange={id => onUpdate({ locale: id })}
        />
      </ProfileSection>

      <ProfileSection title={t("profile.notifications")}>
        <div className="space-y-2">
          <ProfileToggle
            label={t("profile.notifyDrop")}
            checked={user.notifyDrop}
            onChange={notifyDrop => onUpdate({ notifyDrop })}
          />
          <ProfileToggle
            label={t("profile.notifyOrders")}
            checked={user.notifyOrders}
            onChange={notifyOrders => onUpdate({ notifyOrders })}
          />
        </div>
      </ProfileSection>

      <button
        type="button"
        onClick={onLogout}
        className="w-full border border-[var(--accent)]/35 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] transition active:scale-[0.99]"
      >
        {t("profile.logout")}
      </button>
    </div>
  );
}

export function getCheckoutPrefill() {
  const user = getProfile();
  const def = getDefaultAddress();
  const locale = user?.locale ?? getStoredLocale() ?? "ru";
  return {
    name: user?.name,
    phone: user?.phone,
    address: def
      ? `${def.city}, ${def.street}, ${def.house}${def.apt ? `, ${t(locale, "profile.aptSuffix", { apt: def.apt })}` : ""}`
      : undefined,
  };
}
