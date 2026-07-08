import type { DropSnapshot, StorefrontSnapshot } from './types';

export const REMOTE_DROP_API =
  process.env.NEXT_PUBLIC_THE4_API_URL || 'https://the4-admin-api.onrender.com';

export function remoteDropEnabled() {
  return Boolean(REMOTE_DROP_API);
}

export function readDropIdFromLocation() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('drop');
}

export async function fetchRemoteStorefront(): Promise<StorefrontSnapshot | null> {
  try {
    const res = await fetch(`${REMOTE_DROP_API}/storefront`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      storefront: data.storefront,
      drops: data.drops || [],
      products: data.products || [],
    };
  } catch {
    return null;
  }
}

export async function fetchRemoteDrop(vip = false, dropId?: string | null): Promise<DropSnapshot | null> {
  try {
    const params = new URLSearchParams();
    if (vip) params.set('vip', '1');
    if (dropId) params.set('dropId', dropId);
    const qs = params.toString();
    const url = `${REMOTE_DROP_API}/drop${qs ? `?${qs}` : ''}`;
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
  const dropId = readDropIdFromLocation();
  const res = await fetch(REMOTE_DROP_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'public',
      publicAction,
      payload: dropId ? { ...payload, dropId } : payload,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `API ${res.status}`) as Error & { code?: string };
    if (data.code) err.code = data.code;
    throw err;
  }
  return data as T;
}
