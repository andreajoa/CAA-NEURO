with open("app/app/page.jsx") as f:
    content = f.read()

# 1. Remover função defaultBoard (não é mais usada)
import re
content = re.sub(r'function defaultBoard\([^)]+\) \{[^}]+\}\n\n', '', content)

# 2. Trocar useState inicial para array vazio
content = content.replace(
    'const [cards, setCards] = useState(defaultBoard("infantil", "emergente"));',
    'const [cards, setCards] = useState([]); // Carrega de admin_defaults via useEffect'
)

# 3. Verificar se resetBoard existe e está correto
if 'async function resetBoard()' in content:
    # Encontrar e substituir resetBoard
    old_reset = re.search(r'async function resetBoard\(\) \{[^}]+\}', content, re.DOTALL)
    if old_reset:
        new_reset = '''async function resetBoard() {
    try {
      const ar = await fetch(`/api/admin/default-board?profile=${profile}&level=${level}`);
      const ad = await ar.json();
      const next = (ar.ok && ad.cards?.length) ? ad.cards : [];
      await persist(next);
    } catch { await persist([]); }
    setEditing(null); setPhrase([]);
  }'''
        content = content.replace(old_reset.group(0), new_reset)
        print("✅ resetBoard corrigido")
else:
    print("⚠️  resetBoard não encontrado")

with open("app/app/page.jsx", "w") as f:
    f.write(content)

print("✅ defaultBoard removido")
print("✅ useState inicial corrigido")
