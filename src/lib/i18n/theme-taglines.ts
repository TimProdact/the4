import type { Locale } from "./types";

/** Localized product taglines keyed by theme id. */
export const THEME_TAGLINES: Record<string, Record<Locale, string>> = {
  "cream-tube": {
    ru: "Питание без веса",
    uz: "Og'irliksiz parvarish",
    en: "Nourish without weight",
  },
  "cosmetic-mirror": {
    ru: "Смотри честно",
    uz: "Halol qarang",
    en: "Look honestly",
  },
  "pixel-compact": {
    ru: "Тон — в один тап",
    uz: "Ton bir bosishda",
    en: "Tone in one tap",
  },
  "velvet-wings": {
    ru: "Аромат, который летит",
    uz: "Uchib ketadigan hid",
    en: "A scent that flies",
  },
  heart: {
    ru: "Бьётся в такт",
    uz: "Ritmda uradi",
    en: "Beats in rhythm",
  },
  plant: {
    ru: "Живёт на полке",
    uz: "Javon ustida yashaydi",
    en: "Lives on the shelf",
  },
  "toilet-paper": {
    ru: "Нежность в рулоне",
    uz: "Rulondagi nafosat",
    en: "Softness in a roll",
  },
  zombie: {
    ru: "Снимает всё лишнее",
    uz: "Ortiqchani oladi",
    en: "Removes the excess",
  },
  "pixel-figure": {
    ru: "Ретро, но объёмный",
    uz: "Retro, lekin hajmli",
    en: "Retro, but volumetric",
  },
  raccoon: {
    ru: "После бессонной ночи",
    uz: "Uyqusiz tundan keyin",
    en: "After a sleepless night",
  },
  dance: {
    ru: "Макияж не сдвинется",
    uz: "Makiyaj siljimaydi",
    en: "Makeup won't budge",
  },
  bomb: {
    ru: "Заряд для кожи",
    uz: "Teri uchun zaryad",
    en: "Charge for your skin",
  },
  light: {
    ru: "Свет с кожи",
    uz: "Teridan nur",
    en: "Light from skin",
  },
};

export function getThemeTagline(themeId: string, locale: Locale, fallback: string): string {
  return THEME_TAGLINES[themeId]?.[locale] ?? fallback;
}
