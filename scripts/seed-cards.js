// Seed de cards padrão no D1
// Uso: node scripts/seed-cards.js
const cards = [
  {id:"sim",label:"Sim",category:"core",profile:"infantil",level:"emergente"},
  {id:"nao",label:"Não",category:"core",profile:"infantil",level:"emergente"},
  {id:"ajuda",label:"Ajuda",category:"core",profile:"infantil",level:"emergente"},
  {id:"mais",label:"Mais",category:"core",profile:"infantil",level:"emergente"},
  {id:"acabou",label:"Acabou",category:"core",profile:"infantil",level:"emergente"},
  {id:"agua",label:"Água",category:"necessidades",profile:"infantil",level:"emergente"},
  {id:"comer",label:"Comer",category:"necessidades",profile:"infantil",level:"emergente"},
  {id:"banheiro",label:"Banheiro",category:"necessidades",profile:"infantil",level:"emergente"},
  {id:"dor",label:"Dor",category:"saude",profile:"infantil",level:"emergente"},
  {id:"feliz",label:"Feliz",category:"emocoes",profile:"infantil",level:"emergente"},
  {id:"triste",label:"Triste",category:"emocoes",profile:"infantil",level:"emergente"},
  {id:"medo",label:"Medo",category:"emocoes",profile:"infantil",level:"emergente"},
  {id:"bravo",label:"Bravo",category:"emocoes",profile:"infantil",level:"emergente"},
  {id:"cansado",label:"Cansado",category:"emocoes",profile:"infantil",level:"emergente"},
  {id:"brincar",label:"Brincar",category:"acoes",profile:"infantil",level:"emergente"},
  {id:"dormir",label:"Dormir",category:"necessidades",profile:"infantil",level:"emergente"},
  {id:"remedio",label:"Remédio",category:"saude",profile:"infantil",level:"emergente"},
  {id:"escola",label:"Escola",category:"lugares",profile:"infantil",level:"emergente"},
  {id:"parar",label:"Parar",category:"core",profile:"infantil",level:"emergente"},
  {id:"esperar",label:"Esperar",category:"acoes",profile:"infantil",level:"emergente"},
  {id:"me-da",label:"Me dá",category:"core",profile:"infantil",level:"emergente"},
  {id:"nao-quero",label:"Não quero",category:"core",profile:"infantil",level:"emergente"},
  {id:"tomar-banho",label:"Tomar banho",category:"acoes",profile:"infantil",level:"emergente"},
  {id:"sair",label:"Sair",category:"lugares",profile:"infantil",level:"emergente"},
  {id:"passear",label:"Passear",category:"acoes",profile:"infantil",level:"emergente"},
];
console.log(`✅ ${cards.length} cards definidos no seed`);
console.log("Para inserir no D1, use a API /api/cards com POST para cada card.");
cards.forEach(c => console.log(`  ${c.id}: ${c.label} [${c.category}]`));
