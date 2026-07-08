import { pickRandomCatId, type CatAvatarId } from "./cat-avatars";

const ADJECTIVES = [
  "Fluffy",
  "Sleepy",
  "Curious",
  "Chaotic",
  "Cosmic",
  "Ginger",
  "Whisker",
  "Purrfect",
  "Sassy",
  "Velvety",
  "Noir",
  "Lootbox",
  "Cozy",
  "Midnight",
  "Sunny",
  "Pouncing",
] as const;

const NOUNS = [
  "Cat",
  "Kitty",
  "Kitten",
  "Meow",
  "Whiskers",
  "Paws",
  "Moggy",
  "Feline",
  "Chonk",
  "Purr",
  "Claw",
  "Tail",
] as const;

const ACTIONS = ["Naps", "Purrs", "Steals", "Zooms", "Judges", "Kneads", "Hides"] as const;

const PREFIXES = ["Mur", "Kis", "Nya", "Meow", "Bars"] as const;

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function digits(min: number, max: number) {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function generateCatUsername(): string {
  const roll = Math.floor(Math.random() * 5);

  if (roll === 0) return `${pick(ADJECTIVES)}${pick(NOUNS)}${digits(10, 99)}`;
  if (roll === 1) return `${pick(NOUNS)}_${pick(ADJECTIVES)}`;
  if (roll === 2) return `${pick(ADJECTIVES)}${pick(ACTIONS)}`;
  if (roll === 3) return `${pick(PREFIXES)}${pick(["yan", "yanka", "cat", "ik"])}${digits(100, 999)}`;
  return `${pick(NOUNS)}${pick(["zilla", "lord", "boss", "queen", "king"])}`;
}

export interface CatPersona {
  avatarId: CatAvatarId;
  username: string;
}

export function generateCatPersona(): CatPersona {
  return {
    avatarId: pickRandomCatId(),
    username: generateCatUsername(),
  };
}

/** @deprecated use CatPersona */
export type MonkeyPersona = CatPersona;
/** @deprecated */
export const generateMonkeyUsername = generateCatUsername;
/** @deprecated */
export const generateMonkeyPersona = generateCatPersona;
