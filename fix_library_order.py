#!/usr/bin/env python3

# Ordem CORRETA da tela (esquerda→direita, cima→baixo)
correct_order = [
    # Linha 1
    { "id": "sim", "label": "Sim" },
    { "id": "nao", "label": "Não" },
    { "id": "me-da", "label": "Me dá" },
    { "id": "nao-quero", "label": "Não quero" },
    # Linha 2
    { "id": "mais", "label": "Mais" },  # Era "TEMPO" na tela mas o ID é "mais"
    { "id": "agua", "label": "Água" },
    { "id": "comer", "label": "Comer" },
    { "id": "banheiro", "label": "Banheiro" },
    # Linha 3
    { "id": "dor", "label": "Dor" },
    { "id": "dormir", "label": "Dormir" },
    { "id": "remedio", "label": "Remédio" },
    { "id": "feliz", "label": "Feliz" },
    # Linha 4
    { "id": "triste", "label": "Triste" },
    { "id": "tomar-banho", "label": "Tomar banho" },
    { "id": "bravo", "label": "Bravo" },
    { "id": "medo", "label": "Medo" },
    # Linha 5
    { "id": "cansado", "label": "Cansado" },
    { "id": "brincar", "label": "Brincar" },
    { "id": "parar", "label": "Parar" },
    { "id": "sair", "label": "Sair" },
    # Linha 6
    { "id": "passear", "label": "Passear" },
    { "id": "escola", "label": "Escola" },
    { "id": "esperar", "label": "Esperar" },  # Era "VEM CÁ"
    { "id": "acabou", "label": "Acabou" },  # Era "ACABAR"
    # Linha 7
    { "id": "ajuda", "label": "Ajuda" },
]

with open("app/api/images/library/route.js") as f:
    content = f.read()

# Gerar o novo array
new_array = "const platformImages = [\n"
for item in correct_order:
    new_array += f'  {{ id: "{item["id"]}", label: "{item["label"]}", url: "/cards/level-1/{item["id"]}.png", source: "platform" }},\n'
new_array += "];"

# Substituir o array antigo
import re
old_pattern = r'const platformImages = \[[^\]]+\];'
content = re.sub(old_pattern, new_array, content, flags=re.DOTALL)

with open("app/api/images/library/route.js", "w") as f:
    f.write(content)

print("✅ Ordem corrigida conforme a tela!")
print("\nNova ordem:")
for i, item in enumerate(correct_order, 1):
    print(f"{i:2d}. {item['label']}")
