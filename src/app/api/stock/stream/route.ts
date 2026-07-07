import { getPublicSnapshot, subscribe } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let unsub: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(getPublicSnapshot())}\n\n`),
          );
        } catch {
          /* closed */
        }
      };
      send();
      unsub = subscribe(send);
      heartbeat = setInterval(send, 4000);
    },
    cancel() {
      unsub?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
