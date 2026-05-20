const https = require('https');

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID;
const token = process.env.CLOUDFLARE_D1_API_TOKEN;

// Lista CORRETA conforme a tela (da esquerda pra direita, cima pra baixo)
const correctCards = [
  {id:"sim",label:"Sim",image:"/cards/level-1/sim.png",cat:"core"},
  {id:"nao",label:"Não",image:"/cards/level-1/nao.png",cat:"core"},
  {id:"me-da",label:"Me dá",image:"/cards/level-1/me-da.png",cat:"core"},
  {id:"nao-quero",label:"Não quero",image:"/cards/level-1/nao-quero.png",cat:"core"},
  {id:"mais",label:"Mais",image:"/cards/level-1/mais.png",cat:"core"},
  {id:"agua",label:"Água",image:"/cards/level-1/agua.png",cat:"necessidades"},
  {id:"comer",label:"Comer",image:"/cards/level-1/comer.png",cat:"necessidades"},
  {id:"banheiro",label:"Banheiro",image:"/cards/level-1/banheiro.png",cat:"necessidades"},
  {id:"dor",label:"Dor",image:"/cards/level-1/dor.png",cat:"saude"},
  {id:"dormir",label:"Dormir",image:"/cards/level-1/dormir.png",cat:"necessidades"},
  {id:"remedio",label:"Remédio",image:"/cards/level-1/remedio.png",cat:"saude"},
  {id:"feliz",label:"Feliz",image:"/cards/level-1/feliz.png",cat:"emocoes"},
  {id:"triste",label:"Triste",image:"/cards/level-1/triste.png",cat:"emocoes"},
  {id:"tomar-banho",label:"Tomar banho",image:"/cards/level-1/tomar-banho.png",cat:"acoes"},
  {id:"bravo",label:"Bravo",image:"/cards/level-1/bravo.png",cat:"emocoes"},
  {id:"medo",label:"Medo",image:"/cards/level-1/medo.png",cat:"emocoes"},
  {id:"cansado",label:"Cansado",image:"/cards/level-1/cansado.png",cat:"emocoes"},
  {id:"brincar",label:"Brincar",image:"/cards/level-1/brincar.png",cat:"acoes"},
  {id:"parar",label:"Parar",image:"/cards/level-1/parar.png",cat:"core"},
  {id:"sair",label:"Sair",image:"/cards/level-1/sair.png",cat:"lugares"},
  {id:"passear",label:"Passear",image:"/cards/level-1/passear.png",cat:"acoes"},
  {id:"escola",label:"Escola",image:"/cards/level-1/escola.png",cat:"lugares"},
  {id:"esperar",label:"Esperar",image:"/cards/level-1/esperar.png",cat:"acoes"},
  {id:"acabou",label:"Acabou",image:"/cards/level-1/acabou.png",cat:"core"},
  {id:"ajuda",label:"Ajuda",image:"/cards/level-1/ajuda.png",cat:"core"}
];

function sqlReq(sql, params = []) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ sql, params });
    const opts = {
      hostname:'api.cloudflare.com',
      path:`/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
      method:'POST',
      headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}
    };
    const req = https.request(opts, res => {
      let d='';
      res.on('data',x=>d+=x);
      res.on('end',()=>resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const key = 'infantil_emergente';
  const cardsJson = JSON.stringify(correctCards);
  
  const sql = `INSERT INTO admin_defaults (key, cards, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET cards=excluded.cards, updated_at=datetime('now')`;
  
  const result = await sqlReq(sql, [key, cardsJson]);
  
  if (result.success) {
    console.log('✅ admin_defaults atualizado com sucesso!');
    console.log(`Cards salvos: ${correctCards.length}`);
    console.log('\nPrimeiros 5 cards:');
    correctCards.slice(0,5).forEach((c,i)=>console.log(`  ${i+1}. ${c.label}`));
  } else {
    console.log('❌ Erro:', result);
  }
}

main().catch(console.error);
