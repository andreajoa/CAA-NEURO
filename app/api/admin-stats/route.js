import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../lib/d1";
import { isAdmin } from "../../../lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = isAdmin(userId);

  try {
    if (admin) {
      // Dados globais da plataforma inteira
      const [
        totalUsers, totalPro, totalFree,
        totalPatients, totalSessions, totalCards,
        avgDuration, newUsersWeek, newUsersMonth,
        sessionsPerDay, usersPerDay, recentSessions,
        topUsers
      ] = await Promise.all([
        d1Query("SELECT COUNT(*) as total FROM users"),
        d1Query("SELECT COUNT(*) as total FROM users WHERE plano='pro'"),
        d1Query("SELECT COUNT(*) as total FROM users WHERE plano='gratuito' OR plano IS NULL"),
        d1Query("SELECT COUNT(*) as total FROM patients"),
        d1Query("SELECT COUNT(*) as total FROM sessions"),
        d1Query("SELECT COUNT(*) as total FROM cards"),
        d1Query("SELECT AVG(duracao_minutos) as media FROM sessions WHERE duracao_minutos IS NOT NULL"),
        d1Query("SELECT COUNT(*) as total FROM users WHERE created_at > datetime('now','-7 days')"),
        d1Query("SELECT COUNT(*) as total FROM users WHERE created_at > datetime('now','-30 days')"),
        d1Query(`SELECT date(created_at) as dia, COUNT(*) as total FROM sessions 
                 WHERE created_at > datetime('now','-30 days') 
                 GROUP BY dia ORDER BY dia ASC`),
        d1Query(`SELECT date(created_at) as dia, COUNT(*) as total FROM users 
                 WHERE created_at > datetime('now','-30 days') 
                 GROUP BY dia ORDER BY dia ASC`),
        d1Query(`SELECT s.created_at, s.duracao_minutos, s.evolucao_observada, 
                 p.nome as paciente_nome, u.email as profissional_email
                 FROM sessions s 
                 LEFT JOIN patients p ON s.patient_id = p.id
                 LEFT JOIN users u ON s.user_id = u.id
                 ORDER BY s.created_at DESC LIMIT 10`),
        d1Query(`SELECT u.email, u.plano, u.created_at,
                 COUNT(DISTINCT p.id) as total_pacientes,
                 COUNT(DISTINCT s.id) as total_sessoes
                 FROM users u
                 LEFT JOIN patients p ON p.user_id = u.id
                 LEFT JOIN sessions s ON s.user_id = u.id
                 GROUP BY u.id ORDER BY total_sessoes DESC LIMIT 10`),
      ]);

      const mrr = (totalPro?.[0]?.total || 0) * 35;

      return Response.json({
        is_admin: true,
        totals: {
          users: totalUsers?.[0]?.total || 0,
          pro: totalPro?.[0]?.total || 0,
          free: totalFree?.[0]?.total || 0,
          patients: totalPatients?.[0]?.total || 0,
          sessions: totalSessions?.[0]?.total || 0,
          cards: totalCards?.[0]?.total || 0,
          avg_duration: Math.round(avgDuration?.[0]?.media || 0),
          new_users_week: newUsersWeek?.[0]?.total || 0,
          new_users_month: newUsersMonth?.[0]?.total || 0,
          mrr,
          arr: mrr * 12,
          conversion_rate: totalUsers?.[0]?.total > 0
            ? Math.round((totalPro?.[0]?.total || 0) / totalUsers?.[0]?.total * 100)
            : 0,
        },
        sessionsPerDay: sessionsPerDay || [],
        usersPerDay: usersPerDay || [],
        recentSessions: recentSessions || [],
        topUsers: topUsers || [],
      });
    }

    // Dados do usuário individual
    const [patients, sessions, cards, avgDur, sessPerDay] = await Promise.all([
      d1Query("SELECT COUNT(*) as total FROM patients WHERE user_id=?", [userId]),
      d1Query("SELECT COUNT(*) as total FROM sessions WHERE user_id=?", [userId]),
      d1Query("SELECT COUNT(*) as total FROM cards WHERE user_id=?", [userId]),
      d1Query("SELECT AVG(duracao_minutos) as media FROM sessions WHERE user_id=? AND duracao_minutos IS NOT NULL", [userId]),
      d1Query(`SELECT date(created_at) as dia, COUNT(*) as total FROM sessions 
               WHERE user_id=? AND created_at > datetime('now','-30 days') 
               GROUP BY dia ORDER BY dia ASC`, [userId]),
    ]);

    return Response.json({
      is_admin: false,
      totals: {
        patients: patients?.[0]?.total || 0,
        sessions: sessions?.[0]?.total || 0,
        cards: cards?.[0]?.total || 0,
        avg_duration: Math.round(avgDur?.[0]?.media || 0),
      },
      sessionsPerDay: sessPerDay || [],
    });

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
