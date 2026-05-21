import { d1Query } from "../../../lib/d1";

export async function GET() {
  try {
    const boards = [
      ["infantil_inicial", [
        { id:"agua", label:"Água", image:"/cards/level-1/agua.png", cat:"necessidades" },
        { id:"banheiro", label:"Banheiro", image:"/cards/level-1/banheiro.png", cat:"necessidades" },
        { id:"dormir", label:"Dormir", image:"/cards/level-1/dormir.png", cat:"necessidades" },
        { id:"tomar-banho", label:"Banho", image:"/cards/level-1/tomar-banho.png", cat:"necessidades" },
        { id:"lanche", label:"Lanche", image:"", cat:"necessidades" }
      ]],

      ["infantil_frases", [
        { id:"feliz", label:"Feliz", image:"/cards/level-1/feliz.png", cat:"emocoes" },
        { id:"triste", label:"Triste", image:"/cards/level-1/triste.png", cat:"emocoes" },
        { id:"bravo", label:"Bravo", image:"/cards/level-1/bravo.png", cat:"emocoes" },
        { id:"medo", label:"Medo", image:"/cards/level-1/medo.png", cat:"emocoes" },
        { id:"cansado", label:"Cansado", image:"/cards/level-1/cansado.png", cat:"emocoes" }
      ]],

      ["infantil_conversacao", [
        { id:"escola", label:"Escola", image:"/cards/level-1/escola.png", cat:"rotina" },
        { id:"passear", label:"Passear", image:"/cards/level-1/passear.png", cat:"rotina" },
        { id:"brincar", label:"Brincar", image:"/cards/level-1/brincar.png", cat:"rotina" },
        { id:"sair", label:"Sair", image:"/cards/level-1/sair.png", cat:"rotina" },
        { id:"casa", label:"Casa", image:"", cat:"rotina" }
      ]],

      ["infantil_acoes", [
        { id:"parar", label:"Parar", image:"/cards/level-1/parar.png", cat:"acoes" },
        { id:"acabou", label:"Acabou", image:"/cards/level-1/acabou.png", cat:"acoes" },
        { id:"mais", label:"Mais", image:"/cards/level-1/mais.png", cat:"acoes" },
        { id:"remedio", label:"Remédio", image:"/cards/level-1/remedio.png", cat:"acoes" },
        { id:"dor", label:"Dor", image:"/cards/level-1/dor.png", cat:"acoes" }
      ]]
    ];

    for (const [key, cards] of boards) {
      await d1Query(
        "INSERT OR REPLACE INTO admin_defaults (key,value) VALUES (?,?)",
        [key, JSON.stringify(cards)]
      );
    }

    return Response.json({ success:true, updated: boards.map(([key,cards]) => ({ key, total: cards.length })) });
  } catch(e) {
    return Response.json({ error:e.message }, { status:500 });
  }
}
