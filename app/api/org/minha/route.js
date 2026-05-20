import { auth } from "@clerk/nextjs/server";
import { d1Query } from "../../../../lib/d1";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const membership = await d1Query(
      "SELECT org_id, role FROM org_members WHERE user_id=? LIMIT 1", [userId]
    );
    if (!membership?.length) return Response.json({ org: null, members: [] });

    const orgId = membership[0].org_id;
    const [org] = await d1Query("SELECT * FROM organizations WHERE id=?", [orgId]) || [];
    const members = await d1Query("SELECT * FROM org_members WHERE org_id=?", [orgId]) || [];

    return Response.json({ org, members });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
