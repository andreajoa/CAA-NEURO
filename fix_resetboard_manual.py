#!/usr/bin/env python3
with open("app/app/page.jsx") as f:
    lines = f.readlines()

# Encontrar a linha que tem "async function resetBoard"
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Quando encontrar resetBoard, substituir toda a função
    if 'async function resetBoard()' in line:
        # Adicionar a função correta
        new_lines.append('  async function resetBoard() {\n')
        new_lines.append('    try {\n')
        new_lines.append('      const ar = await fetch(`/api/admin/default-board?profile=${profile}&level=${level}`);\n')
        new_lines.append('      const ad = await ar.json();\n')
        new_lines.append('      const next = (ar.ok && ad.cards?.length) ? ad.cards : [];\n')
        new_lines.append('      await persist(next);\n')
        new_lines.append('    } catch { await persist([]); }\n')
        new_lines.append('    setEditing(null); setPhrase([]);\n')
        new_lines.append('  }\n')
        new_lines.append('\n')
        
        # Pular todas as linhas até encontrar o próximo "async function" ou "function"
        i += 1
        while i < len(lines):
            if ('async function' in lines[i] or 'function ' in lines[i]) and 'resetBoard' not in lines[i]:
                break
            i += 1
        continue
    
    new_lines.append(line)
    i += 1

with open("app/app/page.jsx", "w") as f:
    f.writelines(new_lines)

print("✅ resetBoard limpo")
