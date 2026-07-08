import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getSnapshot, runAction } from "./bot-store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AUTH_PATH = join(ROOT, "data", "telegram-admin-chats.json");
const ADMIN_IDS_PATH = join(ROOT, "data", "admin-telegram-ids.json");
const ADMIN_URL = "https://timprodact.github.io/the4/admin/";
const MINI_APP_URL = process.env.THE4_MINI_APP_URL || "https://timprodact.github.io/the4/admin/mini-app-dist/";
const API_URL = process.env.THE4_API_URL || "https://the4-admin-api.timprodact.workers.dev";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "THE4ADMIN";

function loadEnvFile() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN не задан. Добавь в .env");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

function loadAuth() {
  mkdirSync(dirname(AUTH_PATH), { recursive: true });
  if (!existsSync(AUTH_PATH)) return new Set();
  try {
    return new Set(JSON.parse(readFileSync(AUTH_PATH, "utf8")));
  } catch {
    return new Set();
  }
}

function saveAuth(set) {
  mkdirSync(dirname(AUTH_PATH), { recursive: true });
  writeFileSync(AUTH_PATH, JSON.stringify([...set], null, 2));
}

const authorized = loadAuth();
for (const id of (process.env.TELEGRAM_ADMIN_IDS || "").split(",").map(s => s.trim()).filter(Boolean)) {
  authorized.add(Number(id));
}

let offset = 0;

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || "Telegram API error");
  return data.result;
}

function saveAdminId(userId) {
  mkdirSync(dirname(ADMIN_IDS_PATH), { recursive: true });
  let ids = [];
  if (existsSync(ADMIN_IDS_PATH)) {
    try {
      ids = JSON.parse(readFileSync(ADMIN_IDS_PATH, "utf8"));
    } catch {}
  }
  const id = String(userId);
  if (!ids.includes(id)) {
    ids.push(id);
    writeFileSync(ADMIN_IDS_PATH, JSON.stringify(ids, null, 2));
  }
}

async function grantAdminApi(telegramId) {
  saveAdminId(telegramId);
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "grant_admin",
        secret: ADMIN_PASSWORD,
        telegramId,
      }),
    });
  } catch (err) {
    console.warn("grant_admin API:", err.message);
  }
}

async function configureMenuButton() {
  try {
    await tg("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "Админка",
        web_app: { url: MINI_APP_URL },
      },
    });
    console.log(`→ Mini App menu: ${MINI_APP_URL}`);
  } catch (err) {
    console.warn("setChatMenuButton:", err.message);
  }
}

async function send(chatId, text, extra = {}) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

function fmtSnapshot(s) {
  const holds = s.holds.length;
  const ordersPaid = s.orders.filter(o => o.status === "paid").length;
  const ordersPending = s.orders.filter(o => o.status === "pending").length;
  return [
    "<b>THE4 · статус</b>",
    `Фаза: <b>${s.phase}</b>${s.paused ? " (пауза)" : ""}`,
    `Сток: <b>${s.available}</b> / ${s.stock} (всего ${s.totalStock})`,
    `Holds: ${holds}`,
    `Заказы: paid ${ordersPaid} · pending ${ordersPending} · всего ${s.orders.length}`,
    `Waitlist: ${s.waitlist.length}`,
    `Старт: ${new Date(s.startsAt).toLocaleString("ru-RU")}`,
  ].join("\n");
}

function helpText() {
  return [
    "<b>Команды админки</b>",
    "/status — статус дропа",
    "/pause — пауза",
    "/resume — снять паузу",
    "/stock 42 — установить сток",
    "/holds — сбросить holds",
    "/orders — последние заказы",
    "/order 1005 paid — сменить статус",
    "/predrop 2 — pre-drop через N часов",
    "/active — сделать дроп активным",
    "/reset — сброс демо",
    `/web — веб-админка`,
    "/help — эта справка",
  ].join("\n");
}

function isAuthed(chatId) {
  return authorized.has(chatId);
}

function miniAppKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📱 Открыть админку", web_app: { url: MINI_APP_URL } }],
    ],
  };
}

async function handleCommand(chatId, userId, text) {
  const [cmd, ...args] = text.trim().split(/\s+/);
  const lower = cmd.toLowerCase();

  if (lower === "/start" || lower === "/admin") {
    const authed = isAuthed(chatId);
    const body = authed
      ? `🐱 <b>THE4 Admin</b>\n\n${fmtSnapshot(getSnapshot())}\n\nНажми кнопку ниже или «Админка» в меню.`
      : `🐱 <b>THE4 Admin Bot</b>\n\nТвой id: <code>${userId}</code>\n\nДля Mini App сначала:\n<code>/login ${ADMIN_PASSWORD}</code>`;
    await send(chatId, body, { reply_markup: miniAppKeyboard() });
    return;
  }

  if (lower === "/login") {
    const pass = args.join(" ");
    if (pass !== ADMIN_PASSWORD) {
      await send(chatId, "❌ Неверный пароль");
      return;
    }
    authorized.add(chatId);
    saveAuth(authorized);
    await grantAdminApi(userId);
    await send(chatId, `✅ Вход выполнен\n\n${fmtSnapshot(getSnapshot())}\n\nОткрой Mini App:`, {
      reply_markup: miniAppKeyboard(),
    });
    return;
  }

  if (!isAuthed(chatId)) {
    await send(chatId, `🔒 Сначала войди: <code>/login ${ADMIN_PASSWORD}</code>`);
    return;
  }

  try {
    if (lower === "/help") {
      await send(chatId, helpText());
      return;
    }

    if (lower === "/web") {
      await send(chatId, `🌐 Веб-админка:\n${ADMIN_URL}\nПароль: <code>${ADMIN_PASSWORD}</code>`);
      return;
    }

    if (lower === "/status") {
      await send(chatId, fmtSnapshot(getSnapshot()));
      return;
    }

    if (lower === "/pause") {
      const s = runAction("set_paused", { paused: true });
      await send(chatId, `⏸ Дроп на паузе\n\n${fmtSnapshot(s)}`);
      return;
    }

    if (lower === "/resume") {
      const s = runAction("set_paused", { paused: false });
      await send(chatId, `▶️ Дроп снова активен\n\n${fmtSnapshot(s)}`);
      return;
    }

    if (lower === "/stock") {
      const n = Number(args[0]);
      if (!Number.isFinite(n)) {
        await send(chatId, "Использование: <code>/stock 42</code>");
        return;
      }
      const s = runAction("set_stock", { stock: n });
      await send(chatId, `📦 Сток обновлён\n\n${fmtSnapshot(s)}`);
      return;
    }

    if (lower === "/holds") {
      const s = runAction("clear_holds");
      await send(chatId, `🧹 Holds сброшены\n\n${fmtSnapshot(s)}`);
      return;
    }

    if (lower === "/predrop") {
      const hours = Number(args[0] || 1);
      const startsAt = new Date(Date.now() + hours * 3_600_000).toISOString();
      const s = runAction("set_starts_at", { startsAt });
      await send(chatId, `⏳ Pre-drop через ${hours}ч\n\n${fmtSnapshot(s)}`);
      return;
    }

    if (lower === "/active") {
      const s = runAction("set_starts_at", { startsAt: "2020-01-01T00:00:00.000Z" });
      await send(chatId, `🚀 Дроп активен\n\n${fmtSnapshot(s)}`);
      return;
    }

    if (lower === "/reset") {
      const s = runAction("reset_demo");
      await send(chatId, `♻️ Демо сброшено\n\n${fmtSnapshot(s)}`);
      return;
    }

    if (lower === "/orders") {
      const s = getSnapshot();
      const lines = s.orders
        .slice()
        .reverse()
        .slice(0, 8)
        .map(
          o =>
            `#${o.id} ${o.receipt} · ${o.status} · ${o.amount.toLocaleString("ru-RU")} UZS · ${o.buyer.name}`,
        );
      await send(chatId, lines.length ? `<b>Заказы</b>\n${lines.join("\n")}` : "Заказов нет");
      return;
    }

    if (lower === "/order") {
      const id = Number(args[0]);
      const status = args[1];
      if (!id || !["paid", "pending", "failed", "refunded"].includes(status)) {
        await send(chatId, "Использование: <code>/order 1005 paid</code>");
        return;
      }
      const s = runAction("mark_order", { orderId: id, status });
      await send(chatId, `✅ Заказ #${id} → ${status}\n\n${fmtSnapshot(s)}`);
      return;
    }

    await send(chatId, "Неизвестная команда. /help");
  } catch (err) {
    await send(chatId, `❌ ${err instanceof Error ? err.message : "Ошибка"}`);
  }
}

async function poll() {
  const updates = await tg("getUpdates", { offset, timeout: 30 });
  for (const update of updates) {
    offset = update.update_id + 1;
    const msg = update.message;
    if (!msg?.text || !msg.chat?.id) continue;
    if (!msg.text.startsWith("/")) continue;
    try {
      await handleCommand(msg.chat.id, msg.from?.id || msg.chat.id, msg.text);
    } catch (err) {
      console.error("handle error", err);
    }
  }
}

async function main() {
  const me = await tg("getMe", {});
  console.log(`→ THE4 admin bot @${me.username}`);
  console.log(`→ Mini App: ${MINI_APP_URL}`);
  console.log(`→ Web admin: ${ADMIN_URL}`);
  await configureMenuButton();
  console.log("→ Long polling…");

  while (true) {
    try {
      await poll();
    } catch (err) {
      console.error("poll error", err);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

main();
