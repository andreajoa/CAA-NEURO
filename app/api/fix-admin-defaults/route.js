import { d1Query } from "../../../lib/d1";

export async function GET() {
  try {

    const boards = [

      ['infantil_inicial',[
        {label:"Água"},
        {label:"Banheiro"},
        {label:"Dormir"},
        {label:"Banho"},
        {label:"Lanche"}
      ]],

      ['infantil_frases',[
        {label:"Feliz"},
        {label:"Triste"},
        {label:"Bravo"},
        {label:"Medo"},
        {label:"Cansado"}
      ]],

      ['infantil_conversacao',[
        {label:"Escola"},
        {label:"Passear"},
        {label:"Brincar"},
        {label:"Sair"},
        {label:"Casa"}
      ]],

      ['infantil_acoes',[
        {label:"Parar"},
        {label:"Acabou"},
        {label:"Mais"},
        {label:"Remédio"},
        {label:"Dor"}
      ]]

    ];

    for(const [key,cards] of boards){
      await d1Query(
      "INSERT OR REPLACE INTO admin_defaults (key,value) VALUES (?,?)",
      [key,JSON.stringify(cards)]
      );
    }

    return Response.json({success:true});

  } catch(e){
    return Response.json({error:e.message},{status:500})
  }
}
