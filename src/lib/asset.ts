export function asset(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Avoid double-prefix if already resolved
  if (normalized === "/the4" || normalized.startsWith("/the4/")) return normalized;

  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${normalized}`;
}
