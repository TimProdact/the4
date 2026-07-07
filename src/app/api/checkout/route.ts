import { DROP_CONFIG } from "@/lib/drop-config";
import {
  getPublicSnapshot,
  getStore,
  notify,
  purgeExpiredHolds,
  refreshPhase,
} from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { holdId, name, phone, deliveryType, address } = body;

  const store = getStore();
  purgeExpiredHolds(store);

  const hold = holdId ? store.holds[holdId] : null;
  if (!hold || hold.expiresAt < Date.now()) {
    return Response.json({ error: "Резерв истёк. Нажмите BUY NOW снова." }, { status: 410 });
  }

  if (store.stock <= 0) {
    return Response.json({ error: "SOLD OUT" }, { status: 409 });
  }

  await new Promise(r => setTimeout(r, 1200));

  store.stock -= 1;
  delete store.holds[holdId];
  store.lastOrderId += 1;
  refreshPhase(store);

  const orderId = store.lastOrderId;
  notify();

  return Response.json({
    ok: true,
    orderId,
    receipt: `THE4-${orderId}`,
    ...getPublicSnapshot(),
    buyer: { name, phone, deliveryType, address },
    amount: DROP_CONFIG.price,
    taneeshAchievement: "Владелец The4",
  });
}
