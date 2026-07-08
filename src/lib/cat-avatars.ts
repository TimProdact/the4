import { asset } from "./asset";

export const CAT_AVATARS = [
  { id: "cat-001", src: asset("/avatars/cat-001.png"), label: "Мокрый" },
  { id: "cat-002", src: asset("/avatars/cat-002.png"), label: "Вежливый" },
  { id: "cat-003", src: asset("/avatars/cat-003.png"), label: "Язычок" },
  { id: "cat-004", src: asset("/avatars/cat-004.png"), label: "Носик" },
  { id: "cat-005", src: asset("/avatars/cat-005.png"), label: "Селфи" },
  { id: "cat-006", src: asset("/avatars/cat-006.png"), label: "Кхе-кхе" },
  { id: "cat-007", src: asset("/avatars/cat-007.png"), label: "Ой" },
  { id: "cat-008", src: asset("/avatars/cat-008.png"), label: "Ору" },
] as const;

export type CatAvatarId = (typeof CAT_AVATARS)[number]["id"];

export const DEFAULT_CAT_ID: CatAvatarId = "cat-001";

const LEGACY_MONKEY_IDS = new Set([
  "skeptic",
  "phone",
  "mindblown",
  "grin",
  "stare",
  "smirk",
  "baby-car",
  "zen",
]);

export function isCatAvatarId(id?: string | null): id is CatAvatarId {
  return !!id && CAT_AVATARS.some(c => c.id === id);
}

export function pickRandomCatId(): CatAvatarId {
  return CAT_AVATARS[Math.floor(Math.random() * CAT_AVATARS.length)].id;
}

export function getCatAvatar(id?: string | null) {
  if (id && LEGACY_MONKEY_IDS.has(id)) return CAT_AVATARS[0];
  return CAT_AVATARS.find(c => c.id === id) ?? CAT_AVATARS[0];
}
