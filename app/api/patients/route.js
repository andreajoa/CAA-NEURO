import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patients = await d1Query(
    "SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return NextResponse.json({ patients });
}

export async function POST(req) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = body.id || crypto.randomUUID();
  const name = body.name || "";
  const age = body.age || "";
  const notes = body.notes || "";

  await d1Query(
    "INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)",
    [userId, user?.emailAddresses?.[0]?.emailAddress || ""]
  );

  await d1Query(
    "INSERT OR REPLACE INTO patients (id, user_id, name, age, notes) VALUES (?, ?, ?, ?, ?)",
    [id, userId, name, age, notes]
  );

  return NextResponse.json({ patient: { id, user_id: userId, name, age, notes } });
}
