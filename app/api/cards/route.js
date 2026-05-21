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

  let cards = await d1Query(
    "SELECT * FROM cards WHERE user_id = ? AND card_key = ? ORDER BY COALESCE(position_index,9999),created_at ASC",
    [userId, boardKey]
  );

  // Se usuário não tiver nada, herda padrão global admin
  if(!cards.length){

    const adminKey=boardKey.replace("-","_");

    const defaults=await d1Query(
      "SELECT cards FROM admin_defaults WHERE key=? LIMIT 1",
      [adminKey]
    );

    if(defaults?.length){
      cards=JSON.parse(defaults[0].cards||"[]");
    }
  }

  return NextResponse.json({cards});
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

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    await d1Query(
      "INSERT INTO cards (id, user_id, card_key, label, image_url, category, position_index) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        card.id || crypto.randomUUID(),
        userId,
        boardKey,
        card.label || "",
        card.image || card.image_url || "",
        card.cat || card.category || "",
        card.position_index ?? i,
      ]
    );
  }

  return NextResponse.json({ ok: true, count: cards.length });
}
