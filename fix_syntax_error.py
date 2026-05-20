#!/usr/bin/env python3
with open("app/app/page.jsx") as f:
    lines = f.readlines()

# Encontrar e remover linhas problemáticas (39-41)
new_lines = []
skip_next = 0

for i, line in enumerate(lines, 1):
    # Pular as linhas 39-41 que estão quebradas
    if i == 39 and "REMOVIDO: hardcoded" in line:
        skip_next = 3  # Pula essa linha e as próximas 2
        continue
    
    if skip_next > 0:
        skip_next -= 1
        continue
    
    new_lines.append(line)

with open("app/app/page.jsx", "w") as f:
    f.writelines(new_lines)

print("✅ Linhas quebradas removidas")
