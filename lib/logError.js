import { d1Query } from "./d1";
import { sendAlertEmail } from "./sendAlertEmail";

export async function logError({
  userId = "",
  level = "error",
  source = "unknown",
  message = "",
  details = "",
}) {
  try {
    await d1Query(
      "INSERT INTO app_logs (id,user_id,level,source,message,details) VALUES (?,?,?,?,?,?)",
      [
        crypto.randomUUID(),
        userId,
        level,
        source,
        String(message).slice(0, 500),
        typeof details === "string"
          ? details.slice(0, 3000)
          : JSON.stringify(details).slice(0, 3000),
      ]
    );

    if (level === "critical") {
      await sendAlertEmail({
        subject: "🚨 Alerta crítico no CAA Neuro",
        message: `${source}: ${message}`,
      });
    }
  } catch (err) {
    console.error("Failed log:", err);
  }
}
