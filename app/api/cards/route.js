import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { d1Query } from "../../../lib/d1";

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const profile = searchParams.get("profile") || "infantil";
  const level = searchParams.get("level") || "emergente";
  const boardKey = `${profile}-${level}`;

  const cards = await d1Query(
    "SELECT * FROM cards WHERE user_id = ? AND card_key = ? ORDER BY created_at ASC",
    [userId, boardKey]
  );

  return NextResponse.json({ cards });
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const profile = body.profile || "infantil";
  const level = body.level || "emergente";
  const boardKey = `${profile}-${level}`;
  const cards = Array.isArray(body.cards) ? body.cards : [];

  await d1Query(
    "DELETE FROM cards WHERE user_id = ? AND card_key = ?",
    [userId, boardKey]
  );

  for (const card of cards) {
    await d1Query(
      "INSERT INTO cards (id, user_id, card_key, label, image_url, category) VALUES (?, ?, ?, ?, ?, ?)",
      [
        card.id || crypto.randomUUID(),
        userId,
        boardKey,
        card.label || "",
        card.image || card.image_url || "",
        card.cat || card.category || "",
      ]
    );
  }

  return NextResponse.json({ ok: true, count: cards.length });
}
