import { d1Query } from "./d1";

export async function logError({ userId = "", level = "error", source = "unknown", message = "", details = "" }) {
  try {
    await d1Query(
      "INSERT INTO app_logs (id, user_id, level, source, message, details) VALUES (?, ?, ?, ?, ?, ?)",
      [
        crypto.randomUUID(),
        userId || "",
        level,
        source,
        String(message).slice(0, 500),
        typeof details === "string" ? details.slice(0, 3000) : JSON.stringify(details).slice(0, 3000),
      ]
    );
  } catch (err) {
    console.error("Failed to write app log:", err);
  }
}
