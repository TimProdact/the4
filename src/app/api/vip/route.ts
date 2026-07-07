import { DROP_CONFIG } from "@/lib/drop-config";
import { getPublicSnapshot } from "@/lib/store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body.password !== DROP_CONFIG.vipPassword) {
    return Response.json({ ok: false, error: "Неверный пароль" }, { status: 401 });
  }
  return Response.json({ ok: true, vip: true, ...getPublicSnapshot(true) });
}
