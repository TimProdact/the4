import type { Order } from "./types";
import { getStoreOrders } from "./client-store";
import { isCatAvatarId, pickRandomCatId, type CatAvatarId } from "./cat-avatars";
import { setStoredLocale } from "./i18n/locale-storage";

export interface UserProfile {
  phone: string;
  name: string;
  avatarId: CatAvatarId;
  notifyDrop: boolean;
  notifyOrders: boolean;
  locale: "ru" | "uz" | "en";
}

export interface SavedAddress {
  id: string;
  city: string;
  street: string;
  house: string;
  apt: string;
  comment: string;
  isDefault: boolean;
}

interface ProfileData {
  user: UserProfile | null;
  addresses: SavedAddress[];
  pendingPhone: string | null;
}

const KEY = "the4_profile_v1";

function load(): ProfileData {
  if (typeof window === "undefined") return { user: null, addresses: [], pendingPhone: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { user: null, addresses: [], pendingPhone: null };
    return { user: null, addresses: [], pendingPhone: null, ...JSON.parse(raw) };
  } catch {
    return { user: null, addresses: [], pendingPhone: null };
  }
}

function save(data: ProfileData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getProfile(): UserProfile | null {
  const data = load();
  if (data.user && !isCatAvatarId(data.user.avatarId)) {
    data.user.avatarId = pickRandomCatId();
    save(data);
  }
  return data.user;
}

export function logoutProfile() {
  const data = load();
  data.user = null;
  save(data);
}

export function sendOtpMock(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  if (normalized.length < 12) throw new Error("Введите номер +998");
  const data = load();
  data.pendingPhone = phone;
  save(data);
  return { ok: true };
}

export function verifyOtpMock(code: string): { needsName: boolean; user: UserProfile | null } {
  const data = load();
  if (!data.pendingPhone) throw new Error("Сначала введите телефон");
  if (!/^\d{4,6}$/.test(code.replace(/\s/g, ""))) throw new Error("Неверный код");

  const existing = data.user?.phone === data.pendingPhone ? data.user : null;
  if (existing) {
    if (!isCatAvatarId(existing.avatarId)) existing.avatarId = pickRandomCatId();
    data.pendingPhone = null;
    save(data);
    return { needsName: false, user: existing };
  }

  if (!data.user || data.user.phone !== data.pendingPhone) {
    data.user = {
      phone: data.pendingPhone,
      name: "",
      avatarId: pickRandomCatId(),
      notifyDrop: true,
      notifyOrders: true,
      locale: "ru",
    };
  }
  const needsName = !data.user.name.trim();
  data.pendingPhone = null;
  save(data);
  return { needsName, user: data.user };
}

export function setProfileName(name: string) {
  const data = load();
  if (!data.user) throw new Error("Не авторизован");
  data.user.name = name.trim();
  save(data);
  return data.user;
}

export function updateProfileSettings(
  patch: Partial<Pick<UserProfile, "notifyDrop" | "notifyOrders" | "locale">>,
) {
  const data = load();
  if (!data.user) throw new Error("Не авторизован");
  Object.assign(data.user, patch);
  if (patch.locale) setStoredLocale(patch.locale);
  save(data);
  return data.user;
}

export function getAddresses(): SavedAddress[] {
  return load().addresses;
}

export function saveAddress(addr: Omit<SavedAddress, "id"> & { id?: string }) {
  const data = load();
  if (addr.isDefault) {
    data.addresses = data.addresses.map(a => ({ ...a, isDefault: false }));
  }
  if (addr.id) {
    data.addresses = data.addresses.map(a => (a.id === addr.id ? { ...a, ...addr, id: addr.id } : a));
  } else {
    data.addresses.push({
      id: crypto.randomUUID(),
      city: addr.city,
      street: addr.street,
      house: addr.house,
      apt: addr.apt || "",
      comment: addr.comment || "",
      isDefault: addr.isDefault || data.addresses.length === 0,
    });
  }
  save(data);
  return data.addresses;
}

export function deleteAddress(id: string) {
  const data = load();
  data.addresses = data.addresses.filter(a => a.id !== id);
  if (data.addresses.length && !data.addresses.some(a => a.isDefault)) {
    data.addresses[0].isDefault = true;
  }
  save(data);
  return data.addresses;
}

export function getDefaultAddress(): SavedAddress | null {
  const list = getAddresses();
  return list.find(a => a.isDefault) ?? list[0] ?? null;
}

export function getOrdersForUser(phone: string): Order[] {
  const normalized = phone.replace(/\D/g, "");
  return getStoreOrders()
    .filter(o => o.buyer.phone.replace(/\D/g, "") === normalized)
    .reverse();
}
