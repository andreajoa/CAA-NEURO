#!/usr/bin/env python3
with open("app/app/page.jsx") as f:
    content = f.read()

# Procurar e remover a duplicação na função resetBoard
# A função correta deve ser:
correct_resetboard = '''  async function resetBoard() {
    try {
      const ar = await fetch(`/api/admin/default-board?profile=${profile}&level=${level}`);
      const ad = await ar.json();
      const next = (ar.ok && ad.cards?.length) ? ad.cards : [];
      await persist(next);
    } catch { await persist([]); }
    setEditing(null); setPhrase([]);
  }'''

# Encontrar onde começa resetBoard
import re
# Remover tudo desde "async function resetBoard" até o próximo "async function" ou fechamento
pattern = r'async function resetBoard\(\) \{[^}]*\}[^}]*\}[^}]*\}'
content = re.sub(pattern, correct_resetboard, content, count=1)

with open("app/app/page.jsx", "w") as f:
    f.write(content)

print("✅ resetBoard corrigido")
