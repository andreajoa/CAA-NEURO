export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return Response.json({ error: "Arquivo não encontrado." }, { status: 400 });
    if (file.size > 3 * 1024 * 1024) return Response.json({ error: "Máximo 3MB." }, { status: 400 });
    const allowed = ["image/jpeg","image/png","image/webp"];
    if (!allowed.includes(file.type)) return Response.json({ error: "Use JPG, PNG ou WebP." }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return Response.json({ success: true, url: dataUrl });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
