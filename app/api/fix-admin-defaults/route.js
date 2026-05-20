import { d1Query } from "../../../lib/d1";
import { isAdmin } from "../../../lib/admin";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const correctCards = [
  {id:"sim",label:"Sim",image:"/cards/level-1/sim.png?v=20260520-1705",cat:"core"},
  {id:"nao",label:"Não",image:"/cards/level-1/nao.png?v=20260520-1705",cat:"core"},
  {id:"me-da",label:"Me dá",image:"/cards/level-1/me-da.png?v=20260520-1705",cat:"core"},
  {id:"nao-quero",label:"Não quero",image:"/cards/level-1/nao-quero.png?v=20260520-1705",cat:"core"},
  {id:"mais",label:"Mais",image:"/cards/level-1/mais.png?v=20260520-1705",cat:"core"},
  {id:"agua",label:"Água",image:"/cards/level-1/agua.png?v=20260520-1705",cat:"necessidades"},
  {id:"comer",label:"Comer",image:"/cards/level-1/comer.png?v=20260520-1705",cat:"necessidades"},
  {id:"banheiro",label:"Banheiro",image:"/cards/level-1/banheiro.png?v=20260520-1705",cat:"necessidades"},
  {id:"dor",label:"Dor",image:"/cards/level-1/dor.png?v=20260520-1705",cat:"saude"},
  {id:"dormir",label:"Dormir",image:"/cards/level-1/dormir.png?v=20260520-1705",cat:"necessidades"},
  {id:"remedio",label:"Remédio",image:"/cards/level-1/remedio.png?v=20260520-1705",cat:"saude"},
  {id:"tomar-banho",label:"Tomar banho",image:"/cards/level-1/tomar-banho.png?v=20260520-1705",cat:"acoes"},
  {id:"feliz",label:"Feliz",image:"/cards/level-1/feliz.png?v=20260520-1705",cat:"emocoes"},
  {id:"triste",label:"Triste",image:"/cards/level-1/triste.png?v=20260520-1705",cat:"emocoes"},
  {id:"bravo",label:"Bravo",image:"/cards/level-1/bravo.png?v=20260520-1705",cat:"emocoes"},
  {id:"medo",label:"Medo",image:"/cards/level-1/medo.png?v=20260520-1705",cat:"emocoes"},
  {id:"cansado",label:"Cansado",image:"/cards/level-1/cansado.png?v=20260520-1705",cat:"emocoes"},
  {id:"brincar",label:"Brincar",image:"/cards/level-1/brincar.png?v=20260520-1705",cat:"acoes"},
  {id:"parar",label:"Parar",image:"/cards/level-1/parar.png?v=20260520-1705",cat:"core"},
  {id:"sair",label:"Sair",image:"/cards/level-1/sair.png?v=20260520-1705",cat:"lugares"},
  {id:"passear",label:"Passear",image:"/cards/level-1/passear.png?v=20260520-1705",cat:"acoes"},
  {id:"escola",label:"Escola",image:"/cards/level-1/escola.png?v=20260520-1705",cat:"lugares"},
  {id:"esperar",label:"Esperar",image:"/cards/level-1/esperar.png?v=20260520-1705",cat:"acoes"},
  {id:"acabou",label:"Acabou",image:"/cards/level-1/acabou.png?v=20260520-1705",cat:"core"},
  {id:"ajuda",label:"Ajuda",image:"/cards/level-1/ajuda.png?v=20260520-1705",cat:"core"}
];

export async function POST() {
  const { userId } = await auth();
  
  if (!userId || !isAdmin(userId)) {
    return Response.json({ error: "Só admin" }, { status: 403 });
  }

  try {
    await d1Query(
      `INSERT INTO admin_defaults (key, cards, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET cards=excluded.cards, updated_at=datetime('now')`,
      ['infantil_emergente', JSON.stringify(correctCards)]
    );

    return Response.json({ 
      success: true, 
      count: correctCards.length,
      cards: correctCards.map(c => c.label)
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
