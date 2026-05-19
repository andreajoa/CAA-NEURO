import { d1Query } from "./d1";

// Limites por endpoint (requests por minuto)
const LIMITS = {
  default: 60,
  "generate-card-image": 5,
  insights: 10,
  report: 20,
  export: 20,
};

export async function checkRateLimit(userId, endpoint) {
  const limit = LIMITS[endpoint] || LIMITS.default;
  const windowMinutes = 1;

  try {
    // Contar requests no último minuto
    const rows = await d1Query(
      `SELECT SUM(count) as total FROM rate_limits
       WHERE user_id=? AND endpoint=?
       AND window_start > datetime('now', '-${windowMinutes} minutes')`,
      [userId, endpoint]
    );

    const total = rows?.[0]?.total || 0;

    if (total >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        message: `Limite de ${limit} requests por minuto atingido. Aguarde um momento.`,
      };
    }

    // Registrar request atual
    await d1Query(
      `INSERT INTO rate_limits (user_id, endpoint, count, window_start)
       VALUES (?, ?, 1, datetime('now'))`,
      [userId, endpoint]
    );

    // Limpar registros antigos a cada 10 requests (probabilístico)
    if (Math.random() < 0.1) {
      await d1Query(
        "DELETE FROM rate_limits WHERE window_start < datetime('now', '-5 minutes')",
        []
      ).catch(() => {});
    }

    return { allowed: true, limit, remaining: limit - total - 1 };
  } catch {
    // Em caso de erro no rate limit, deixa passar
    return { allowed: true, limit, remaining: limit };
  }
}
