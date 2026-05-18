import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";

export async function POST(req) {
  const { userId } = await auth();

  try {
    const body = await req.json();

    await d1Query(
      "INSERT INTO app_logs (id, user_id, level, source, message, details) VALUES (?, ?, ?, ?, ?, ?)",
      [
        crypto.randomUUID(),
        userId || "",
        body.level || "error",
        body.source || "client",
        String(body.message || "").slice(0, 500),
        JSON.stringify(body.details || {}).slice(0, 3000),
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Log API error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await d1Query(
    "SELECT * FROM app_logs ORDER BY created_at DESC LIMIT 100",
    []
  );

  return NextResponse.json({ logs });
}
