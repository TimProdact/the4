const PREVIEW_PRE_DROP_KEY = "the4_pre_drop_target";
const PREVIEW_PRE_DROP_MS = 24 * 3600_000;

/** Real countdown target for Pre-Drop (preview uses +24h when store date is in the past). */
export function resolvePreDropStartsAt(startsAt: string, previewMode = false): string {
  const targetMs = new Date(startsAt).getTime();
  if (!Number.isNaN(targetMs) && targetMs > Date.now()) {
    return startsAt;
  }

  if (previewMode) {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(PREVIEW_PRE_DROP_KEY);
      if (saved && new Date(saved).getTime() > Date.now()) {
        return saved;
      }
      const next = new Date(Date.now() + PREVIEW_PRE_DROP_MS).toISOString();
      sessionStorage.setItem(PREVIEW_PRE_DROP_KEY, next);
      return next;
    }
    return new Date(Date.now() + PREVIEW_PRE_DROP_MS).toISOString();
  }

  return startsAt;
}
