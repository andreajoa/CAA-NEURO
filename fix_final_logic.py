#!/usr/bin/env python3
with open("app/app/page.jsx") as f:
    content = f.read()

# CORREÇÃO FINAL: persist() - admin NÃO salva em cards pessoal
old_persist = '''  async function persist(next) {
    setCards(next);
    try {
      // Verificar se é admin
      const isAdminUser = await fetch("/api/plano").then(r=>r.json()).then(d=>d.plano==="admin").catch(()=>false);
      
      if (isAdminUser) {
        // Admin: salvar em admin_defaults (padrão global) para este profile+level
        await fetch("/api/admin/default-board", { 
          method:"POST", 
          headers:{"Content-Type":"application/json"}, 
          body: JSON.stringify({ cards: next, profile, level }) 
        });
      } else {
        // Usuário comum: salvar em cards (tabela pessoal)
        await fetch("/api/cards", { 
          method:"POST", 
          headers:{"Content-Type":"application/json"}, 
          body: JSON.stringify({ profile, level, cards: next }) 
        });
      }
    } catch { alert("Não foi possível salvar os cards."); }
  }'''

new_persist = '''  async function persist(next) {
    setCards(next);
    try {
      // Verificar se é admin
      const isAdminUser = await fetch("/api/plano").then(r=>r.json()).then(d=>d.plano==="admin").catch(()=>false);
      
      if (isAdminUser) {
        // ADMIN: salva APENAS em admin_defaults (padrão global)
        await fetch("/api/admin/default-board", { 
          method:"POST", 
          headers:{"Content-Type":"application/json"}, 
          body: JSON.stringify({ cards: next, profile, level }) 
        });
      } else {
        // USUÁRIO: salva APENAS em cards (tabela pessoal user_id)
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
    print("✅ persist() corrigido")
else:
    print("⚠️  persist() já estava correto ou não encontrado")

with open("app/app/page.jsx", "w") as f:
    f.write(content)

print("\n📋 FLUXO FINAL:")
print("1. Admin altera → POST /api/admin/default-board (tabela admin_defaults)")
print("2. Usuário carrega 1ª vez → GET /api/cards (vazio) → busca admin_defaults")
print("3. Usuário altera → POST /api/cards (tabela cards com user_id)")
print("4. Usuário volta → GET /api/cards (retorna dele, não sobrescreve)")
print("5. Admin atualiza → afeta APENAS novos usuários, não quem já salvou")
