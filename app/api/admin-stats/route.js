import { auth } from "@clerk/nextjs/server";
const getDB = (req) => req.env?.DB || globalThis.__D1_DB;

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = getDB(request);
    const [patients, sessions, cards, images, logs, recentSessions] = await Promise.all([
      db.prepare("SELECT COUNT(*) as total FROM patients WHERE user_id=?").bind(userId).first(),
      db.prepare("SELECT COUNT(*) as total FROM sessions WHERE user_id=?").bind(userId).first(),
      db.prepare("SELECT COUNT(*) as total FROM cards WHERE user_id=?").bind(userId).first(),
      db.prepare("SELECT COUNT(*) as total FROM images WHERE user_id=?").bind(userId).first(),
      db.prepare("SELECT COUNT(*) as total FROM error_logs WHERE created_at > datetime('now','-7 days')").first().catch(()=>({total:0})),
      db.prepare(`
        SELECT s.id, s.created_at, s.duracao_minutos, s.evolucao_observada, p.nome as paciente_nome
        FROM sessions s LEFT JOIN patients p ON s.patient_id = p.id
        WHERE s.user_id=? ORDER BY s.created_at DESC LIMIT 10
      `).bind(userId).all(),
    ]);

    const sessionsPerDay = await db.prepare(`
      SELECT date(created_at) as dia, COUNT(*) as total
      FROM sessions WHERE user_id=? AND created_at > datetime('now','-30 days')
      GROUP BY dia ORDER BY dia ASC
    `).bind(userId).all();

    const avgDuration = await db.prepare(
      "SELECT AVG(duracao_minutos) as media FROM sessions WHERE user_id=? AND duracao_minutos IS NOT NULL"
    ).bind(userId).first();

    return Response.json({
      totals: {
        patients: patients?.total || 0,
        sessions: sessions?.total || 0,
        cards: cards?.total || 0,
        images: images?.total || 0,
        errors_7d: logs?.total || 0,
        avg_duration: Math.round(avgDuration?.media || 0),
      },
      recentSessions: recentSessions.results || [],
      sessionsPerDay: sessionsPerDay.results || [],
    });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
