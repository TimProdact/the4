import { asset } from "./asset";

const MEOW_FILES = [
  "meow-45.mp3",
  "meow-86.mp3",
  "meow-87.mp3",
  "meow-88.mp3",
  "meow-93.mp3",
  "meow-2578.mp3",
] as const;

const STORAGE_KEY = "the4_cat_sounds_v1";
const MIN_INTERVAL_MS = 140;
const VOLUME = 0.42;

let enabled = true;
let lastPlayedAt = 0;
const pool: HTMLAudioElement[] = [];

function canUseAudio() {
  return typeof window !== "undefined" && typeof Audio !== "undefined";
}

export function isCatSoundsEnabled() {
  return enabled;
}

export function setCatSoundsEnabled(next: boolean) {
  enabled = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: next }));
  }
}

export function loadCatSoundsPreference() {
  if (!canUseAudio()) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as { enabled?: boolean };
    if (typeof data.enabled === "boolean") enabled = data.enabled;
  } catch {
    /* ignore */
  }
}

function pickMeowSrc() {
  const file = MEOW_FILES[Math.floor(Math.random() * MEOW_FILES.length)];
  return asset(`/sounds/${file}`);
}

function borrowAudio() {
  const free = pool.find(a => a.paused || a.ended);
  if (free) return free;
  const audio = new Audio();
  audio.preload = "auto";
  pool.push(audio);
  return audio;
}

export function playCatMeow() {
  if (!canUseAudio() || !enabled) return;

  const now = Date.now();
  if (now - lastPlayedAt < MIN_INTERVAL_MS) return;
  lastPlayedAt = now;

  const audio = borrowAudio();
  audio.src = pickMeowSrc();
  audio.volume = VOLUME;
  audio.playbackRate = 0.88 + Math.random() * 0.24;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    /* blocked until user gesture — next click will work */
  });
}

export function primeCatSounds() {
  if (!canUseAudio()) return;
  for (const file of MEOW_FILES.slice(0, 2)) {
    const audio = borrowAudio();
    audio.src = asset(`/sounds/${file}`);
    audio.preload = "auto";
    audio.load();
  }
}
