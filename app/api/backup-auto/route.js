import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";
import { isAdmin } from "../../../lib/admin";

async function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (cronSecret && authorization === `Bearer ${cronSecret}`) return true;

  const { userId } = await auth().catch(() => ({ userId: null }));
  return Boolean(userId && isAdmin(userId));
}

async function createBackup(request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [patients, sessions, cards, logs] = await Promise.all([
      d1Query("SELECT * FROM patients"),
      d1Query("SELECT * FROM sessions"),
      d1Query("SELECT * FROM cards"),
      d1Query("SELECT * FROM app_logs"),
    ]);

    const id = crypto.randomUUID();
    const snapshot = { createdAt: new Date().toISOString(), patients, sessions, cards, logs };

    await d1Query(
      "INSERT INTO backups (id,snapshot,created_at) VALUES (?,?,datetime('now'))",
      [id, JSON.stringify(snapshot)]
    );

    return NextResponse.json({ success: true, id, createdAt: snapshot.createdAt });
  } catch (error) {
    console.error("Automatic backup failed:", error);
    return NextResponse.json({ success: false, error: "Não foi possível criar o backup." }, { status: 500 });
  }
}

// Vercel Cron executa requisições GET. POST permanece disponível para execução manual.
export const GET = createBackup;
export const POST = createBackup;
