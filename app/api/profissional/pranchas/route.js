import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error:"Unauthorized" }, { status:401 });

  const rows = await d1Query(
    "SELECT token,title,cards,created_at FROM shared_boards WHERE user_id=? AND profile='terapeutica' ORDER BY created_at DESC",
    [userId]
  );

  return Response.json({
    boards:(rows||[]).map(r=>({...r,cards:JSON.parse(r.cards||"[]")}))
  });
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error:"Unauthorized" }, { status:401 });

  const body = await request.json();
  const cards = body.cards || [];
  const title = body.title || "Prancha terapêutica";
  const token = body.token || crypto.randomUUID().replace(/-/g,"").slice(0,16);

  const exists = await d1Query("SELECT token FROM shared_boards WHERE token=? AND user_id=?", [token,userId]);

  if (exists?.length) {
    await d1Query(
      "UPDATE shared_boards SET title=?, cards=? WHERE token=? AND user_id=?",
      [title, JSON.stringify(cards), token, userId]
    );
  } else {
    await d1Query(
      "INSERT INTO shared_boards (token,user_id,profile,level,cards,title,created_at) VALUES (?,?,?,?,?,?,datetime('now'))",
      [token,userId,"terapeutica","custom",JSON.stringify(cards),title]
    );
  }

  return Response.json({ token, url:`https://www.adhdautism.online/prancha/${token}` });
}
