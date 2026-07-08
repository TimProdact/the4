import type { DropSnapshot } from './types';

export const REMOTE_DROP_API =
  process.env.NEXT_PUBLIC_THE4_API_URL || 'https://the4-admin-api.onrender.com';

export function remoteDropEnabled() {
  return Boolean(REMOTE_DROP_API);
}

export async function fetchRemoteDrop(vip = false): Promise<DropSnapshot | null> {
  try {
    const url = vip ? `${REMOTE_DROP_API}/drop?vip=1` : `${REMOTE_DROP_API}/drop`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (vip && data.phase === 'pre_drop') {
      return { ...data, phase: 'active' };
    }
    return data as DropSnapshot;
  } catch {
    return null;
  }
}

export async function remotePublicAction<T>(publicAction: string, payload: Record<string, unknown> = {}) {
  const res = await fetch(REMOTE_DROP_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'public', publicAction, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `API ${res.status}`) as Error & { code?: string };
    if (data.code) err.code = data.code;
    throw err;
  }
  return data as T;
}
