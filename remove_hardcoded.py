with open("app/app/page.jsx") as f:
    lines = f.readlines()

# Encontrar e comentar o array hardcoded (linhas 39-65 aprox)
new_lines = []
skip_until = -1
for i, line in enumerate(lines):
    if "const infantilEmergente = [" in line:
        new_lines.append("// REMOVIDO: hardcoded infantilEmergente não é mais usado\n")
        skip_until = i + 30  # Pular próximas 30 linhas
    elif i < skip_until:
        continue  # Pula linhas do array
    elif skip_until > 0 and "].map(" in line:
        skip_until = -1  # Terminou o array
        continue
    else:
        new_lines.append(line)

with open("app/app/page.jsx", "w") as f:
    f.writelines(new_lines)
    
print("✅ Hardcoded removido")
