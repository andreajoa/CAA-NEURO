import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const url = new URL(request.url);
  const admin = url.searchParams.get("admin");
  const { userId } = await auth().catch(() => ({ userId: null }));
  try {
    const db = getDB(request);
    let results;
    if (admin === "1" && userId) {
      const r = await db.prepare("SELECT * FROM testimonials ORDER BY created_at DESC LIMIT 100").all();
      results = r.results;
    } else {
      const r = await db.prepare("SELECT id,nome,profissao,cidade,texto,foto_url,destaque,created_at FROM testimonials WHERE aprovado=1 ORDER BY destaque DESC,created_at DESC LIMIT 50").all();
      results = r.results;
    }
    return Response.json({ testimonials: results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nome, profissao, cidade, texto, foto_url } = await request.json();
    if (!nome?.trim() || !texto?.trim()) return Response.json({ error: "Nome e texto obrigatórios." }, { status: 400 });
    const db = getDB(request);
    const result = await db.prepare(
      "INSERT INTO testimonials (nome,profissao,cidade,texto,foto_url,aprovado,created_at) VALUES (?,?,?,?,?,0,datetime('now'))"
    ).bind(nome.trim(), profissao?.trim()||null, cidade?.trim()||null, texto.trim(), foto_url?.trim()||null).run();
    return Response.json({ success: true, id: result.meta?.last_row_id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, aprovado, destaque } = await request.json();
    const db = getDB(request);
    if (aprovado !== undefined) await db.prepare("UPDATE testimonials SET aprovado=? WHERE id=?").bind(aprovado?1:0, id).run();
    if (destaque !== undefined) await db.prepare("UPDATE testimonials SET destaque=? WHERE id=?").bind(destaque?1:0, id).run();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await request.json();
    const db = getDB(request);
    await db.prepare("DELETE FROM testimonials WHERE id=?").bind(id).run();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
