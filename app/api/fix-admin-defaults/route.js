import { d1Query } from "../../../lib/d1";

export async function GET() {
  try {

    const boards = [

      ["infantil_inicial",[
        {id:"agua",label:"Água",cat:"necessidades"},
        {id:"banheiro",label:"Banheiro",cat:"necessidades"},
        {id:"dormir",label:"Dormir",cat:"necessidades"},
        {id:"tomar-banho",label:"Banho",cat:"necessidades"},
        {id:"lanche",label:"Lanche",cat:"necessidades"}
      ]],

      ["infantil_frases",[
        {id:"feliz",label:"Feliz",cat:"emocoes"},
        {id:"triste",label:"Triste",cat:"emocoes"},
        {id:"bravo",label:"Bravo",cat:"emocoes"},
        {id:"medo",label:"Medo",cat:"emocoes"},
        {id:"cansado",label:"Cansado",cat:"emocoes"}
      ]],

      ["infantil_conversacao",[
        {id:"escola",label:"Escola",cat:"rotina"},
        {id:"passear",label:"Passear",cat:"rotina"},
        {id:"brincar",label:"Brincar",cat:"rotina"},
        {id:"sair",label:"Sair",cat:"rotina"},
        {id:"casa",label:"Casa",cat:"rotina"}
      ]],

      ["infantil_acoes",[
        {id:"parar",label:"Parar",cat:"acoes"},
        {id:"acabou",label:"Acabou",cat:"acoes"},
        {id:"mais",label:"Mais",cat:"acoes"},
        {id:"remedio",label:"Remédio",cat:"acoes"},
        {id:"dor",label:"Dor",cat:"acoes"}
      ]]
    ];

    for (const [key,cards] of boards){

      await d1Query(
      `INSERT INTO admin_defaults
      (key,cards,updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key)
      DO UPDATE SET
      cards=excluded.cards,
      updated_at=datetime('now')`,
      [key,JSON.stringify(cards)]
      );

    }

    return Response.json({success:true});

  } catch(e){
    return Response.json({error:e.message},{status:500});
  }
}
