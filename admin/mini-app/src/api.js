import { getInitData } from './telegram-init.js';

const API_URL =
  import.meta.env.VITE_THE4_API_URL ||
  'https://the4-admin-api.onrender.com';

function initData() {
  return getInitData();
}

async function tgApi(action, payload = {}) {
  const init = initData();
  if (!init) {
    throw new Error('Откройте админку через кнопку «Админка» в боте @pocketpals_bot');
  }

  let res;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (API_URL.includes('loca.lt')) {
      headers['Bypass-Tunnel-Reminder'] = 'true';
    }
    res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, initData: init, ...payload }),
    });
  } catch {
    throw new Error('Нет сети. Проверьте интернет и попробуйте снова.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || `Ошибка сервера (${res.status})`;
    if (res.status === 401) {
      throw new Error('Сессия истекла. Закройте админку и откройте заново из бота.');
    }
    throw new Error(msg);
  }
  return data;
}

export async function bootstrap() {
  return tgApi('bootstrap');
}

export async function adminAction(adminAction, payload = {}) {
  return tgApi('admin_action', { adminAction, payload });
}

export function haptic(type = 'selection') {
  const h = window.Telegram?.WebApp?.HapticFeedback;
  if (!h) return;
  if (type === 'success') h.notificationOccurred('success');
  else if (type === 'error') h.notificationOccurred('error');
  else if (type === 'light') h.impactOccurred('light');
  else h.selectionChanged();
}

export function showError(message) {
  const tg = window.Telegram?.WebApp;
  haptic('error');
  if (tg?.showAlert) tg.showAlert(String(message));
  else alert(String(message));
}

export async function runActionSafe(adminAction, payload = {}) {
  try {
    const data = await adminAction(adminAction, payload);
    haptic('success');
    return data.snapshot;
  } catch (e) {
    showError(e.message);
    throw e;
  }
}

export async function copyText(text) {
  const tg = window.Telegram?.WebApp;
  try {
    await navigator.clipboard.writeText(text);
    tg?.showAlert?.('Скопировано');
    haptic('success');
  } catch {
    tg?.showAlert?.('Не удалось скопировать');
  }
}
