import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

// GET — SSE stream: o paciente se conecta e recebe updates em tempo real
export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token"); // token da shared_board
  const patientKey = url.searchParams.get("key"); // user_id+boardKey para prancha privada

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", ts: Date.now() });

      // Poll a cada 5 segundos por mudanças
      let lastHash = "";
      let ticks = 0;

      const poll = async () => {
        try {
          let cards = [];
          if (token) {
            const rows = await d1Query("SELECT cards, title FROM shared_boards WHERE token=?", [token]);
            if (rows?.[0]) {
              const parsed = typeof rows[0].cards === "string" ? JSON.parse(rows[0].cards) : rows[0].cards;
              cards = parsed;
            }
          }
          const hash = JSON.stringify(cards).length + "_" + (cards[0]?.label || "");
          if (hash !== lastHash) {
            lastHash = hash;
            send({ type: "update", cards, ts: Date.now() });
          } else {
            send({ type: "ping", ts: Date.now() });
          }
          ticks++;
          // Fechar após 10 min (120 ticks × 5s)
          if (ticks < 120) {
            setTimeout(poll, 5000);
          } else {
            send({ type: "timeout" });
            controller.close();
          }
        } catch {
          controller.close();
        }
      };

      setTimeout(poll, 5000);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

// POST — notificar update (chamado quando o fonoaudiólogo salva a prancha)
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { token } = await request.json();
    // O próprio PUT do /api/share já atualiza o D1
    // Esta rota é um hook para futuras integrações WebSocket/push
    return Response.json({ ok: true, message: "Sync notificado — paciente receberá update em até 5s" });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
