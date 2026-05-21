import { d1Query } from "../../../lib/d1";

export async function GET() {
  const cards = [
    { id:"ansioso", label:"Estou ansioso", cat:"sentimentos", image:"/cards/level-1/cansado.webp?v=20260521-optimized" },
    { id:"cansado-a", label:"Estou cansado", cat:"sentimentos", image:"/cards/level-1/cansado.webp?v=20260521-optimized" },
    { id:"desconfortavel", label:"Estou desconfortável", cat:"sentimentos", image:"/cards/level-1/cansado.webp?v=20260521-optimized" },
    { id:"nao-quero-a", label:"Não quero isso", cat:"sentimentos", image:"/cards/level-1/nao-quero.webp?v=20260521-optimized" },
    { id:"nao-toque", label:"Não toque em mim", cat:"sentimentos", image:"/cards/level-1/nao.webp?v=20260521-optimized" },
    { id:"fale-devagar-a", label:"Fale mais devagar", cat:"sentimentos", image:"/cards/level-1/ajuda.webp?v=20260521-optimized" },
    { id:"fale-baixo", label:"Fale mais baixo", cat:"sentimentos", image:"/cards/level-1/ajuda.webp?v=20260521-optimized" },
    { id:"privacidade-a", label:"Quero privacidade", cat:"sentimentos", image:"/cards/level-1/nao-quero.webp?v=20260521-optimized" },
    { id:"me-acalmar", label:"Preciso me acalmar", cat:"sentimentos", image:"/cards/level-1/cansado.webp?v=20260521-optimized" },
    { id:"respeite-tempo", label:"Respeite meu tempo", cat:"sentimentos", image:"/cards/level-1/esperar.webp?v=20260521-optimized" }
  ];

  await d1Query(
    `INSERT INTO admin_defaults (key,cards,updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET cards=excluded.cards, updated_at=datetime('now')`,
    ["adulto_conversacao", JSON.stringify(cards)]
  );

  return Response.json({ success:true, key:"adulto_conversacao", total:cards.length });
}
