import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(request.url).searchParams.get("q");
  if (!q) return Response.json({ results: [] });

  try {
    const res = await fetch(
      `https://api.arasaac.org/v1/pictograms/pt/search/${encodeURIComponent(q)}`,
      { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) return Response.json({ results: [] });

    const data = await res.json();
    const results = (Array.isArray(data) ? data : []).slice(0, 30).map(item => ({
      id: `arasaac-${item._id}`,
      label: item.keywords?.[0]?.keyword || q,
      url: `https://static.arasaac.org/pictograms/${item._id}/${item._id}_300.png`,
      source: "arasaac",
      arasaac_id: item._id,
    }));

    return Response.json({ results });
  } catch (e) {
    return Response.json({ error: e.message, results: [] }, { status: 500 });
  }
}
