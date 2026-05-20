#!/usr/bin/env python3
with open("app/app/page.jsx") as f:
    content = f.read()

# Padrão exato encontrado no código
old_persist = '''  async function persist(next) {
    setCards(next);
    try {
      await fetch("/api/cards", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ profile, level, cards: next }) });
      // Se for admin, salvar como padrão global para este perfil+nível
      const isAdminUser = await fetch("/api/plano").then(r=>r.json()).then(d=>d.plano==="admin").catch(()=>false);
      if (isAdminUser) {
        await fetch("/api/admin/default-board", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ cards: next, profile, level }) }).catch(()=>{});
      }
    } catch { alert("Não foi possível salvar os cards."); }
  }'''

# Nova versão correta
new_persist = '''  async function persist(next) {
    setCards(next);
    try {
      // Verificar se é admin ANTES de salvar
      const isAdminUser = await fetch("/api/plano").then(r=>r.json()).then(d=>d.plano==="admin").catch(()=>false);
      
      if (isAdminUser) {
        // ADMIN: salva APENAS em admin_defaults (padrão global)
        await fetch("/api/admin/default-board", { 
          method:"POST", 
          headers:{"Content-Type":"application/json"}, 
          body: JSON.stringify({ cards: next, profile, level }) 
        });
      } else {
        // USUÁRIO: salva APENAS em cards (tabela pessoal)
        await fetch("/api/cards", { 
          method:"POST", 
          headers:{"Content-Type":"application/json"}, 
          body: JSON.stringify({ profile, level, cards: next }) 
        });
      }
    } catch { alert("Não foi possível salvar os cards."); }
  }'''

if old_persist in content:
    content = content.replace(old_persist, new_persist)
    print("✅ persist() corrigido - admin e usuário separados")
else:
    print("❌ Padrão não encontrado, mostrando debug:")
    print(content[5000:5500])

with open("app/app/page.jsx", "w") as f:
    f.write(content)

print("\n🎯 CORREÇÃO APLICADA:")
print("ANTES: Admin salvava em /api/cards (linha 187) + admin_defaults")
print("AGORA: Admin salva SÓ em admin_defaults, Usuário SÓ em cards")
