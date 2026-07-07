import { DROP_CONFIG } from "@/lib/drop-config";
import {
  availableStock,
  getPublicSnapshot,
  getStore,
  notify,
  purgeExpiredHolds,
} from "@/lib/store";
import { randomUUID } from "crypto";

export async function POST() {
  const store = getStore();
  purgeExpiredHolds(store);

  if (store.stock <= 0) {
    return Response.json({ error: "SOLD OUT" }, { status: 409 });
  }
  if (availableStock(store) <= 0) {
    return Response.json({ error: "Все в резерве, попробуйте через минуту" }, { status: 409 });
  }

  const holdId = randomUUID();
  const expiresAt = Date.now() + DROP_CONFIG.holdMinutes * 60_000;
  store.holds[holdId] = { expiresAt };
  notify();

  return Response.json({
    holdId,
    expiresAt,
    ...getPublicSnapshot(),
  });
}
