import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const row = await db.prepare("SELECT * FROM user_prefs WHERE user_id=?").bind(userId).first();
    return Response.json({ prefs: row || { onboarding_done: 0 } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const db = getDB(request);
    await db.prepare(
      `INSERT INTO user_prefs (user_id, onboarding_done, nome_profissional, registro_crfa, profissao, conselho_regional, telefone, assinatura_base64, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET
         onboarding_done = COALESCE(excluded.onboarding_done, onboarding_done),
         nome_profissional = COALESCE(excluded.nome_profissional, nome_profissional),
         registro_crfa = COALESCE(excluded.registro_crfa, registro_crfa),
         profissao = COALESCE(excluded.profissao, profissao),
         conselho_regional = COALESCE(excluded.conselho_regional, conselho_regional),
         telefone = COALESCE(excluded.telefone, telefone),
         assinatura_base64 = COALESCE(excluded.assinatura_base64, assinatura_base64),
         updated_at = datetime('now')`
    ).bind(
      userId,
      body.onboarding_done ? 1 : 0,
      body.nome_profissional || null,
      body.registro_crfa || null,
      body.profissao || null,
      body.conselho_regional || null,
      body.telefone || null,
      body.assinatura_base64 || null,
    ).run();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
