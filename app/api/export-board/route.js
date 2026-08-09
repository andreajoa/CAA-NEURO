import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function safeImageUrl(value, requestUrl) {
  try {
    const url = new URL(String(value || ""), requestUrl);
    return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : "";
  } catch {
    return "";
  }
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { cards, title, cols } = await request.json();
  if (!Array.isArray(cards) || !cards.length) return new Response("Sem cards", { status: 400 });
  if (cards.length > 200) return new Response("Máximo de 200 cards", { status: 400 });

  const numCols = Math.min(8, Math.max(2, Number(cols) || 5));
  const safeTitle = escapeHtml(String(title || "Prancha CAA").slice(0, 120));
  const cardW = 150;
  const cardH = 160;
  const gap = 12;
  const padX = 40;
  const padY = 60;
  const rows = Math.ceil(cards.length / numCols);
  const pageW = padX * 2 + numCols * (cardW + gap) - gap;
  const pageH = padY * 2 + 80 + rows * (cardH + gap) - gap;

  const cardHTML = cards.map((card, i) => {
    const col = i % numCols;
    const row = Math.floor(i / numCols);
    const x = padX + col * (cardW + gap);
    const y = padY + 80 + row * (cardH + gap);
    const imageUrl = safeImageUrl(card.image, request.url);
    const imgTag = imageUrl
      ? `<img src="${imageUrl}" style="width:90px;height:90px;object-fit:contain;display:block;margin:0 auto 8px;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : `<div style="width:90px;height:90px;background:#f3f4f6;border-radius:10px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:32px;">🖼️</div>`;
    return `
      <div style="position:absolute;left:${x}px;top:${y}px;width:${cardW}px;height:${cardH}px;
        border:2px solid #e5e7eb;border-radius:14px;background:white;padding:12px 8px 8px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        ${imgTag}
        <div style="font-size:13px;font-weight:700;color:#1B2D5B;text-align:center;line-height:1.3;word-break:break-word;">
          ${escapeHtml(String(card.label || "").slice(0, 100))}
        </div>
      </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>${safeTitle}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background: white; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    @page { margin: 0.5cm; }
  }
</style>
</head>
<body>
<div class="no-print" style="background:#1B2D5B;color:white;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;">
  <span style="font-weight:700;font-size:16px;">CAA Neuro — Prancha: ${safeTitle}</span>
  <div style="display:flex;gap:10px;">
    <button onclick="window.print()" style="background:#C76B4A;color:white;border:none;padding:9px 20px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px;">🖨️ Imprimir / Salvar PDF</button>
    <button onclick="window.close()" style="background:rgba(255,255,255,0.15);color:white;border:none;padding:9px 16px;border-radius:8px;cursor:pointer;font-size:14px;">Fechar</button>
  </div>
</div>
<div style="position:relative;width:${pageW}px;min-height:${pageH}px;margin:0 auto;">
  <div style="padding:${padY}px ${padX}px 0;font-size:22px;font-weight:800;color:#1B2D5B;text-align:center;height:80px;display:flex;align-items:center;justify-content:center;">
    ${safeTitle}
  </div>
  ${cardHTML}
  <div style="position:absolute;bottom:16px;left:0;right:0;text-align:center;font-size:11px;color:#9ca3af;">
    CAA Neuro · caa-neuro.com.br · Gerado em ${new Date().toLocaleDateString("pt-BR")}
  </div>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Board-Title": encodeURIComponent(title || "prancha"),
      "Content-Security-Policy": "default-src 'none'; img-src 'self' https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
