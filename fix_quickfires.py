#!/usr/bin/env python3
with open("app/app/page.jsx") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Linha ~513 (antes do button QuickFires)
    if i > 0 and '<div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>' in lines[i-1] and '<button key={i}' in line:
        # Adicionar o .map que está faltando
        new_lines.append('                  {quickFirePhrases.map((f, i) => (\n')
    
    new_lines.append(line)

with open("app/app/page.jsx", "w") as f:
    f.writelines(new_lines)

print("✅ .map() adicionado")
