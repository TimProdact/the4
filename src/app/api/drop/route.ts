import { getPublicSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const vip = url.searchParams.get("vip") === "1";
  return Response.json(getPublicSnapshot(vip));
}
