import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const esp = url.searchParams.get("especialidade");
  const estado = url.searchParams.get("estado");
  const q = url.searchParams.get("q");

  try {
    let sql = `SELECT up.id, up.user_id, up.nome_profissional, up.profissao,
                      up.conselho_regional, up.telefone, up.cidade, up.estado,
                      up.bio, up.atende_online, up.foto_url, up.especialidades
               FROM user_prefs up
               WHERE up.visivel_diretorio = 1
                 AND up.nome_profissional IS NOT NULL
                 AND up.profissao IS NOT NULL`;
    const params = [];
    if (esp) { sql += ` AND up.profissao = ?`; params.push(esp); }
    if (estado) { sql += ` AND up.estado = ?`; params.push(estado); }
    if (q) { sql += ` AND (up.nome_profissional LIKE ? OR up.cidade LIKE ?)`; params.push(`%${q}%`, `%${q}%`); }
    sql += ` ORDER BY up.nome_profissional ASC LIMIT 100`;

    const rows = await d1Query(sql, params);
    return Response.json({ profissionais: rows || [], total: rows?.length || 0 });
  } catch (e) {
    return Response.json({ error: e.message, profissionais: [] }, { status: 500 });
  }
}

// Profissional atualiza seu próprio perfil público
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { visivel, bio, cidade, estado, atende_online, foto_url, especialidades } = await request.json();
    await d1Query(
      `UPDATE user_prefs SET
         visivel_diretorio = ?,
         bio = ?,
         cidade = ?,
         estado = ?,
         atende_online = ?,
         foto_url = COALESCE(?, foto_url),
         especialidades = ?
       WHERE user_id = ?`,
      [visivel ? 1 : 0, bio || null, cidade || null, estado || null,
       atende_online ? 1 : 0, foto_url || null, especialidades || null, userId]
    );
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
