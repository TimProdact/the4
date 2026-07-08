export type AnalyticsEvent =
  | "drop_view"
  | "buy_now_click"
  | "checkout_open"
  | "checkout_hold"
  | "checkout_paid"
  | "checkout_failed"
  | "hold_expired"
  | "race_lost"
  | "waitlist_join"
  | "profile_open"
  | "share_click";

interface AnalyticsEntry {
  event: AnalyticsEvent;
  at: number;
  meta?: Record<string, string | number | boolean>;
}

const KEY = "the4_analytics_v1";

function load(): AnalyticsEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsEntry[];
  } catch {
    return [];
  }
}

function save(entries: AnalyticsEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entries.slice(-500)));
}

export function trackEvent(event: AnalyticsEvent, meta?: AnalyticsEntry["meta"]) {
  const entries = load();
  entries.push({ event, at: Date.now(), meta });
  save(entries);
}

export function getAnalyticsSummary() {
  const entries = load();
  const count = (event: AnalyticsEvent) => entries.filter(e => e.event === event).length;

  return {
    dropViews: count("drop_view"),
    buyNowClicks: count("buy_now_click"),
    checkoutOpens: count("checkout_open"),
    checkoutHolds: count("checkout_hold"),
    checkoutPaid: count("checkout_paid"),
    checkoutFailed: count("checkout_failed"),
    holdExpired: count("hold_expired"),
    raceLost: count("race_lost"),
    waitlistJoins: count("waitlist_join"),
    profileOpens: count("profile_open"),
    shareClicks: count("share_click"),
    total: entries.length,
  };
}

export function resetAnalytics() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
