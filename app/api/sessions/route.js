import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await d1Query(
    "SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
    [userId]
  );

  return NextResponse.json({ sessions });
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = body.id || crypto.randomUUID();

  await d1Query(
    `INSERT INTO sessions 
    (id, user_id, patient_id, profile, level, phrase, note) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      body.patient_id || "",
      body.profile || "",
      body.level || "",
      body.phrase || "",
      body.note || "",
    ]
  );

  return NextResponse.json({ ok: true, id });
}
