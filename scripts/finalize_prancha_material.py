#!/usr/bin/env python3
"""Finaliza o material Complete com a Silaba sem rasterizar o PDF.

Requer PyMuPDF. O script preserva as fichas vetoriais, corrige o conteudo,
amplia a tipografia e gera os dois PDFs finais mais um ZIP de entrega.
"""

from __future__ import annotations

import argparse
import math
import zipfile
from pathlib import Path

import fitz


PAGE = fitz.paper_rect("a4")
NAVY = (27 / 255, 45 / 255, 91 / 255)
ACCENT = (199 / 255, 107 / 255, 74 / 255)
PAPER = (255 / 255, 250 / 255, 244 / 255)
SOFT = (245 / 255, 237 / 255, 232 / 255)
PINK = (232 / 255, 180 / 255, 168 / 255)
WHITE = (1, 1, 1)
MUTED = (74 / 255, 85 / 255, 104 / 255)

AUTHOR = "Margareth Almeida, Neuropsicopedagoga"
LEGAL = "Proibida a revenda, a comercialização por terceiros, o compartilhamento e a distribuição deste material."

ANSWER_KEY = [
    ("CA", ["CASA", "CAMA", "BOCA", "VACA", "MACACO"]),
    ("CA", ["SACADA", "PICADA", "CANECA", "CAMISA", "CAVALO"]),
    ("CO", ["COPO", "COLA", "COCO", "CORACAO", "MACACO"]),
    ("CO", ["SACOLA", "ESCOLA", "PICOLE", "COMIDA", "COELHO"]),
    ("BA", ["BALA", "BANANA", "BATATA", "CABANA", "BACIA"]),
    ("BA", ["BALEIA", "BALANCA", "BARULHO", "BARATA", "BAU"]),
    ("BO", ["BOLA", "BOLO", "BOCA", "BOTA", "BONECA"]),
    ("BO", ["BOLACHA", "CABO", "BORRACHA", "BONITO", "BOLINHA"]),
    ("DA", ["DADO", "DAMA", "DATA", "DANO", "CADA"]),
    ("DA", ["NADA", "RODA", "ESCADA", "PIADA", "AJUDA"]),
    ("DO", ["DOCE", "DONA", "DOENTE", "DOMINO", "DEDO"]),
    ("DO", ["MEDO", "LADO", "DADO", "TECIDO", "COLADO"]),
    ("FA", ["FACA", "FADA", "FAROFA", "FAMILIA", "FAZENDA"]),
    ("FA", ["FARINHA", "FAGULHA", "FAVELA", "GIRAFA", "ALFACE"]),
    ("FO", ["FOCA", "FOGO", "FOTO", "FOLHA", "FOGUEIRA"]),
    ("FO", ["FOGAO", "FOCADO", "AFOGADO", "TELEFONE", "SEMAFORO"]),
    ("LA", ["LATA", "LACO", "LAGO", "LAVA", "LADO"]),
    ("LA", ["BOLA", "MALA", "SALA", "COLA", "ESTRELA"]),
    ("LO", ["LOBO", "LODO", "LOJA", "LOCAO", "LOTE"]),
    ("LO", ["BOLO", "GELO", "CAVALO", "TIJOLO", "COLO"]),
    ("MA", ["MALA", "MAPA", "MATO", "MACACO", "MADEIRA"]),
    ("MA", ["MARAVILHA", "CAMA", "TOMATE", "PIJAMA", "SEMANA"]),
    ("MO", ["MOLA", "MOTO", "MORANGO", "MOEDA", "MOCHILA"]),
    ("MO", ["MORADIA", "CAMOMILA", "LIMONADA", "REMO", "AMORA"]),
    ("NA", ["NADA", "NATA", "NAVIO", "NARIZ", "NAMORADO"]),
    ("NA", ["BANANA", "CANAL", "ANACONDA", "IGUANA", "MENINA"]),
    ("NO", ["NOTA", "NOVE", "NOVO", "NOME", "NOVELO"]),
    ("NO", ["NOVILHO", "CANO", "PIANO", "CANOLA", "SINO"]),
    ("PA", ["PATO", "PATA", "PANELA", "PAPAGAIO", "PALITO"]),
    ("PA", ["PAREDE", "CAPA", "MAPA", "SOPA", "SAPATO"]),
    ("PO", ["POTE", "POVO", "POCO", "POEIRA", "POMAR"]),
    ("PO", ["POLICIA", "PODER", "SAPO", "COPO", "TOPO"]),
    ("RA", ["RATO", "RALO", "RAMO", "RAPOSA", "RAQUETE"]),
    ("RA", ["RAIZ", "CARA", "ARARA", "BARATA", "GIRAFA"]),
    ("RO", ["RODA", "ROSA", "ROLO", "ROTA", "ROLETA"]),
    ("RO", ["ROMA", "ROCHA", "GAROTO", "GAROA", "COROA"]),
    ("SA", ["SAPO", "SACO", "SALA", "SAPATO", "SACOLA"]),
    ("SA", ["SALADA", "CASA", "MESA", "ROSA", "CAMISA"]),
    ("SO", ["SOPA", "SOCO", "SONO", "SOFA", "SOGRA"]),
    ("SO", ["SOMA", "SOJA", "SORO", "CASO", "VASO"]),
    ("TA", ["TAPA", "TACA", "TATU", "TAPIOCA", "TAREFA"]),
    ("TA", ["TAPETE", "BATATA", "PIRATA", "BARATA", "LATA"]),
    ("TO", ["TOCA", "TODA", "TOPO", "TOMATE", "TOCADOR"]),
    ("TO", ["TOALHA", "TONELADA", "PATO", "RATO", "GATO"]),
    ("VA", ["VACA", "VASO", "VARA", "VALE", "VARAL"]),
    ("VA", ["VARETA", "CAVALO", "LAVA", "UVA", "ESCOVA"]),
    ("VE", ["VELA", "VEIA", "VERAO", "VELHO", "VELOCIDADE"]),
    ("VE", ["NOVE", "CHOVE", "SORVETE", "AVE", "CHAVE"]),
    ("VI", ["VILA", "VIDA", "VIVO", "VIOLA", "VIAGEM"]),
    ("VI", ["VITRINE", "VIZINHO", "AVIAO", "OUVIDO", "TELEVISAO"]),
]

ACCENTS = {
    "CORACAO": "CORAÇÃO", "PICOLE": "PICOLÉ", "BALANCA": "BALANÇA", "BAU": "BAÚ",
    "DOMINO": "DOMINÓ", "FAMILIA": "FAMÍLIA", "FOGAO": "FOGÃO", "SEMAFORO": "SEMÁFORO",
    "LACO": "LAÇO", "LOCAO": "LOÇÃO", "POCO": "POÇO", "POLICIA": "POLÍCIA",
    "ROMA": "ROMÃ", "SOFA": "SOFÁ", "TACA": "TAÇA", "VERAO": "VERÃO",
    "AVIAO": "AVIÃO", "TELEVISAO": "TELEVISÃO",
}


def accented(text: str) -> str:
    return ACCENTS.get(text, text)


def add_page(doc: fitz.Document, fill=PAPER) -> fitz.Page:
    page = doc.new_page(width=PAGE.width, height=PAGE.height)
    page.draw_rect(page.rect, color=None, fill=fill)
    return page


def text(page: fitz.Page, rect, value: str, size: float, *, bold=False, color=NAVY,
         align=fitz.TEXT_ALIGN_LEFT, lineheight=1.2) -> None:
    page.insert_textbox(
        fitz.Rect(rect), value, fontsize=size, fontname="hebo" if bold else "helv",
        color=color, align=align, lineheight=lineheight,
    )


def footer(page: fitz.Page, page_no: int, total: int | None = None) -> None:
    page.draw_line((36, 804), (559, 804), color=PINK, width=0.7)
    text(page, (36, 810, 520, 822), f"Material autoral: {AUTHOR}. Todos os direitos reservados.", 7.6, bold=True)
    text(page, (36, 823, 540, 836), LEGAL, 6.9, color=MUTED)
    number = f"{page_no}" if total is None else f"{page_no}/{total}"
    text(page, (540, 811, 559, 835), number, 7.6, bold=True, align=fitz.TEXT_ALIGN_RIGHT)


def rounded_box(page: fitz.Page, rect, *, fill=WHITE, stroke=PINK, radius=10, width=1) -> None:
    box = fitz.Rect(rect)
    normalized_radius = min(0.5, radius / min(box.width, box.height))
    page.draw_rect(box, color=stroke, fill=fill, width=width, radius=normalized_radius)


def build_intro(doc: fitz.Document) -> None:
    page = add_page(doc)
    text(page, (44, 54, 551, 108), "COMPLETE COM A SÍLABA", 30, bold=True, align=fitz.TEXT_ALIGN_CENTER, lineheight=1.0)
    text(page, (65, 116, 530, 148), "Atividades interativas com velcro", 17, bold=True, color=ACCENT, align=fitz.TEXT_ALIGN_CENTER)
    text(page, (75, 153, 520, 178), "50 fichas reutilizáveis para alfabetização e consciência silábica", 11.5, color=MUTED, align=fitz.TEXT_ALIGN_CENTER)
    rounded_box(page, (54, 215, 541, 604), fill=SOFT, stroke=ACCENT, radius=18, width=1.4)
    text(page, (84, 240, 511, 278), "COMO FUNCIONA?", 18, bold=True, align=fitz.TEXT_ALIGN_CENTER)
    steps = [
        ("1", "OBSERVE", "Leia as partes da palavra incompleta."),
        ("2", "COMPLETE", "Fixe a sílaba móvel no espaço com velcro."),
        ("3", "LEIA", "Pronuncie a palavra formada em voz alta."),
    ]
    y = 296
    for number, title, body in steps:
        page.draw_circle((103, y + 27), 20, color=ACCENT, fill=ACCENT)
        text(page, (85, y + 12, 121, y + 42), number, 15, bold=True, color=WHITE, align=fitz.TEXT_ALIGN_CENTER)
        text(page, (143, y + 4, 476, y + 28), title, 13, bold=True)
        text(page, (143, y + 30, 480, y + 58), body, 11.2, color=MUTED)
        y += 88
    text(page, (76, 640, 519, 681), "PI  +  CA  +  DA  =  PICADA", 21, bold=True, color=NAVY, align=fitz.TEXT_ALIGN_CENTER)
    text(page, (80, 710, 515, 738), "MARGARETH ALMEIDA", 14, bold=True, color=ACCENT, align=fitz.TEXT_ALIGN_CENTER)
    text(page, (80, 742, 515, 768), "Neuropsicopedagoga | Material pedagógico autoral", 10.5, color=MUTED, align=fitz.TEXT_ALIGN_CENTER)
    footer(page, 1)

    page = add_page(doc)
    text(page, (44, 56, 551, 94), "APRESENTAÇÃO", 25, bold=True)
    paragraphs = [
        "Complete com a sílaba é um recurso manipulável criado para favorecer a alfabetização de maneira concreta, visual e participativa. Em cada ficha, a criança observa as partes da palavra e escolhe a sílaba móvel que completa todas as formações.",
        "O material pode ser utilizado no atendimento individual, em pequenos grupos, no reforço escolar, no AEE ou em sala de aula. A repetição da sílaba em palavras diferentes contribui para a percepção de regularidades, a leitura e a ampliação do vocabulário.",
        "As 50 fichas estão organizadas em 25 folhas, com duas propostas por página. Cada sílaba aparece em duas fichas diferentes, permitindo variar as palavras sem alterar a dinâmica.",
    ]
    y = 120
    for p in paragraphs:
        used = page.insert_textbox(fitz.Rect(52, y, 543, y + 92), p, fontsize=11.6, fontname="helv", color=MUTED, lineheight=1.35)
        y += 95 if used < 0 else max(74, 92 - used + 24)
    text(page, (52, 410, 543, 442), "HABILIDADES ESTIMULADAS", 15, bold=True, color=ACCENT)
    skills = [
        "Consciência silábica e fonológica",
        "Leitura e formação de palavras",
        "Atenção, memória de trabalho e discriminação visual",
        "Coordenação motora fina e autonomia",
    ]
    positions = [(52, 462, 289, 547), (306, 462, 543, 547), (52, 565, 289, 668), (306, 565, 543, 668)]
    for i, (skill, rect) in enumerate(zip(skills, positions), start=1):
        rounded_box(page, rect, fill=WHITE, stroke=PINK, radius=12)
        text(page, (rect[0] + 16, rect[1] + 14, rect[0] + 52, rect[1] + 45), str(i), 14, bold=True, color=ACCENT)
        text(page, (rect[0] + 52, rect[1] + 16, rect[2] - 14, rect[3] - 12), skill, 10.7, bold=True, lineheight=1.25)
    footer(page, 2)

    page = add_page(doc)
    text(page, (44, 56, 551, 94), "COMO PREPARAR E UTILIZAR", 25, bold=True)
    steps = [
        ("IMPRIMA", "Use papel de maior gramatura ou papel comum, conforme sua preferência."),
        ("RECORTE", "Separe as duas fichas na linha indicada e recorte a peça silábica lateral."),
        ("PLASTIFIQUE", "Plastifique fichas e peças para aumentar a durabilidade do material."),
        ("APLIQUE O VELCRO", "Cole uma parte no espaço central e a outra no verso da sílaba móvel."),
        ("APRESENTE", "Peça à criança que leia as partes, escolha a peça e complete cada palavra."),
        ("CONFIRA", "Use o gabarito para mediar a leitura e verificar as respostas."),
    ]
    boxes = []
    for row in range(3):
        for col in range(2):
            x = 44 + col * 257
            y = 120 + row * 166
            boxes.append((x, y, x + 238, y + 142))
    for i, ((title, body), rect) in enumerate(zip(steps, boxes), start=1):
        rounded_box(page, rect, fill=WHITE, stroke=PINK, radius=12)
        page.draw_circle((rect[0] + 28, rect[1] + 28), 16, color=ACCENT, fill=ACCENT)
        text(page, (rect[0] + 14, rect[1] + 16, rect[0] + 42, rect[1] + 39), str(i), 11.5, bold=True, color=WHITE, align=fitz.TEXT_ALIGN_CENTER)
        text(page, (rect[0] + 54, rect[1] + 18, rect[2] - 12, rect[1] + 45), title, 11.5, bold=True)
        text(page, (rect[0] + 18, rect[1] + 62, rect[2] - 18, rect[3] - 16), body, 10.3, color=MUTED, lineheight=1.3)
    rounded_box(page, (44, 642, 551, 764), fill=SOFT, stroke=ACCENT, radius=12, width=1.2)
    text(page, (64, 660, 531, 686), "DICA DE MEDIAÇÃO", 12.5, bold=True, color=ACCENT)
    text(page, (64, 696, 531, 748), "Antes de corrigir, convide a criança a pronunciar lentamente a palavra e a bater palmas para cada sílaba.", 11.3, color=MUTED, lineheight=1.3)
    footer(page, 3)

    page = add_page(doc)
    text(page, (44, 56, 551, 94), "ORIENTAÇÕES DE USO", 25, bold=True)
    blocks = [
        ("USO PEDAGÓGICO", "O comprador pode imprimir o material quantas vezes forem necessárias para uso próprio, em sua turma ou em seus atendimentos."),
        ("PROTEÇÃO DO MATERIAL", "Não é permitido compartilhar o arquivo digital, revendê-lo, disponibilizá-lo em grupos, plataformas ou redes sociais, nem retirar a identificação de autoria."),
        ("SEGURANÇA", "As peças pequenas devem ser utilizadas com supervisão de um adulto, especialmente com crianças que levam objetos à boca."),
        ("ACESSIBILIDADE", "Apresente uma ficha por vez, reduza a quantidade de estímulos quando necessário e ofereça ajuda gradual, respeitando o ritmo da criança."),
    ]
    y = 120
    for title, body in blocks:
        rounded_box(page, (44, y, 551, y + 112), fill=WHITE, stroke=PINK, radius=12)
        text(page, (64, y + 18, 531, y + 42), title, 12, bold=True, color=ACCENT)
        text(page, (64, y + 50, 531, y + 98), body, 10.7, color=MUTED, lineheight=1.3)
        y += 128
    rounded_box(page, (44, 654, 551, 770), fill=SOFT, stroke=ACCENT, radius=12, width=1.2)
    text(page, (64, 673, 531, 699), "DIREITOS AUTORAIS", 12, bold=True, color=ACCENT)
    text(page, (64, 708, 531, 756), f"Este material pertence a {AUTHOR}. É proibida a revenda, a comercialização por terceiros, a distribuição e o compartilhamento do arquivo digital.", 10.7, bold=True, lineheight=1.3)
    footer(page, 4)


def replace_fragment(page: fitz.Page, old: str, new: str, *, choose_y: float | None = None) -> None:
    matches = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                if span["text"].strip() == old and math.isclose(span["size"], 23.0, abs_tol=0.2):
                    if choose_y is None or abs(span["origin"][1] - choose_y) < 20:
                        matches.append(span)
    if len(matches) != 1:
        raise RuntimeError(f"Esperava 1 ocorrencia de {old!r}; encontrei {len(matches)}")
    span = matches[0]
    page.add_redact_annot(fitz.Rect(span["bbox"]) + (-2, -2, 2, 2), fill=WHITE)
    page.apply_redactions()
    x0, x1 = (118, 296) if span["origin"][0] < 300 else (360, 538)
    fs = 26.0
    while fitz.get_text_length(new, fontname="hebo", fontsize=fs) > (x1 - x0 - 18):
        fs -= 0.5
    width = fitz.get_text_length(new, fontname="hebo", fontsize=fs)
    page.insert_text(((x0 + x1 - width) / 2, span["origin"][1]), new, fontsize=fs, fontname="hebo", color=NAVY)


def enlarge_activity_words(page: fitz.Page) -> None:
    spans = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                if math.isclose(span["size"], 23.0, abs_tol=0.2) or math.isclose(span["size"], 22.0, abs_tol=0.2):
                    spans.append(span)
    for span in spans:
        page.add_redact_annot(fitz.Rect(span["bbox"]) + (-2, -2, 2, 2), fill=WHITE)
    page.apply_redactions()
    for span in spans:
        value = span["text"].strip()
        origin_x, origin_y = span["origin"]
        if origin_x < 100:
            x0, x1 = 39, 89
        elif origin_x < 300:
            x0, x1 = 118, 296
        else:
            x0, x1 = 360, 538
        fs = 26.0
        while fitz.get_text_length(value, fontname="hebo", fontsize=fs) > (x1 - x0 - 16):
            fs -= 0.5
        width = fitz.get_text_length(value, fontname="hebo", fontsize=fs)
        page.insert_text(((x0 + x1 - width) / 2, origin_y), value, fontsize=fs, fontname="hebo", color=NAVY)


def replace_footer(page: fitz.Page, page_no: int) -> None:
    page.add_redact_annot(fitz.Rect(30, 803, 565, 842), fill=PAPER)
    page.apply_redactions()
    footer(page, page_no)


def build_answer_pages(doc: fitz.Document) -> None:
    fills = [(244 / 255, 224 / 255, 211 / 255), (229 / 255, 238 / 255, 247 / 255),
             (250 / 255, 235 / 255, 191 / 255), (228 / 255, 241 / 255, 232 / 255),
             (248 / 255, 229 / 255, 236 / 255)]
    for group in range(5):
        page = add_page(doc)
        text(page, (44, 50, 551, 92), "GABARITO", 25, bold=True, align=fitz.TEXT_ALIGN_CENTER)
        for row, (syllable, words) in enumerate(ANSWER_KEY[group * 10:(group + 1) * 10]):
            ficha = group * 10 + row + 1
            y = 112 + row * 67
            rounded_box(page, (42, y, 553, y + 54), fill=fills[row % len(fills)], stroke=None, radius=9, width=0)
            text(page, (56, y + 10, 156, y + 38), f"FICHA {ficha:02d} | {syllable}", 10.2, bold=True, color=ACCENT)
            answers = "  |  ".join(accented(word) for word in words)
            text(page, (166, y + 10, 537, y + 42), answers, 10.4, color=NAVY, lineheight=1.15)
        footer(page, 30 + group)


def build_tracking_page(doc: fitz.Document) -> None:
    page = add_page(doc)
    text(page, (44, 50, 551, 92), "REGISTRO DE ACOMPANHAMENTO", 23, bold=True, align=fitz.TEXT_ALIGN_CENTER)
    text(page, (44, 110, 145, 134), "CRIANÇA:", 10.5, bold=True, color=ACCENT)
    page.draw_line((126, 132), (551, 132), color=NAVY, width=0.8)
    headers = ["DATA", "FICHAS", "REALIZOU", "COM AJUDA", "OBSERVAÇÕES"]
    xs = [44, 108, 178, 269, 371, 551]
    top = 165
    row_h = 42
    page.draw_rect(fitz.Rect(xs[0], top, xs[-1], top + row_h), color=NAVY, fill=NAVY, width=1)
    for i, label in enumerate(headers):
        text(page, (xs[i] + 4, top + 13, xs[i + 1] - 4, top + 34), label, 8.8, bold=True, color=WHITE, align=fitz.TEXT_ALIGN_CENTER)
    for row in range(11):
        y0 = top + row_h * (row + 1)
        fill = WHITE if row % 2 == 0 else SOFT
        page.draw_rect(fitz.Rect(xs[0], y0, xs[-1], y0 + row_h), color=PINK, fill=fill, width=0.7)
    for x in xs:
        page.draw_line((x, top), (x, top + row_h * 12), color=PINK, width=0.7)
    rounded_box(page, (44, 700, 551, 784), fill=SOFT, stroke=ACCENT, radius=10)
    text(page, (58, 713, 537, 735), "LEGENDA SUGERIDA", 10.5, bold=True, color=ACCENT)
    text(page, (58, 742, 537, 760), "I = independente   |   AV = ajuda verbal   |   AG = ajuda gestual   |   AF = ajuda física", 9.2, color=NAVY)
    text(page, (58, 763, 537, 780), "Registre também as palavras que precisaram de maior mediação.", 8.8, color=MUTED)
    footer(page, 35)


def build_main(source_path: Path, output_path: Path) -> None:
    source = fitz.open(source_path)
    if source.page_count != 35:
        raise RuntimeError(f"PDF principal inesperado: {source.page_count} paginas")
    doc = fitz.open()
    build_intro(doc)
    doc.insert_pdf(source, from_page=4, to_page=28)

    corrections = [
        (10, "IDO", "ENTE", None),
        (14, "RO", "ÇÃO", None),
        (17, "RIO", "L", None),
        (22, "PA", "TA", None),
        (24, "VETE", "FÁ", None),
        (24, "VA", "JA", 573),
        (25, "BOA", "REFA", None),
        (28, "SO", "SOR", None),
        (29, "NO", "VO", None),
    ]
    for page_no, old, new, choose_y in corrections:
        replace_fragment(doc[page_no - 1], old, new, choose_y=choose_y)

    for page_no in range(5, 30):
        page = doc[page_no - 1]
        enlarge_activity_words(page)

    for page_no in range(5, 30):
        replace_footer(doc[page_no - 1], page_no)

    build_answer_pages(doc)
    build_tracking_page(doc)
    if doc.page_count != 35:
        raise RuntimeError(f"Saida principal inesperada: {doc.page_count} paginas")
    doc.set_metadata({
        "title": "Complete com a Sílaba | 50 fichas reutilizáveis",
        "author": AUTHOR,
        "subject": "Alfabetização, consciência silábica e atividade com velcro",
        "keywords": "alfabetização, sílabas, velcro, neuropsicopedagogia",
        "creator": AUTHOR,
    })
    doc.save(output_path, garbage=4, deflate=True, clean=True)


def build_pieces(source_path: Path, output_path: Path) -> None:
    doc = fitz.open(source_path)
    if doc.page_count != 2:
        raise RuntimeError(f"PDF de pecas inesperado: {doc.page_count} paginas")
    syllables = {item[0] for item in ANSWER_KEY}
    for page_no, page in enumerate(doc, start=1):
        spans = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                for span in line["spans"]:
                    value = span["text"].strip()
                    if value in syllables and math.isclose(span["size"], 13.0, abs_tol=0.2):
                        spans.append(span)
        if len(spans) != 25:
            raise RuntimeError(f"Esperava 25 silabas na pagina {page_no}; encontrei {len(spans)}")
        for span in spans:
            page.add_redact_annot(fitz.Rect(span["bbox"]) + (-2, -2, 2, 2), fill=WHITE)
        page.apply_redactions()
        for span in spans:
            value = span["text"].strip()
            center_x = (span["bbox"][0] + span["bbox"][2]) / 2
            width = fitz.get_text_length(value, fontname="hebo", fontsize=17)
            page.insert_text((center_x - width / 2, span["origin"][1] + 1.5), value, fontsize=17, fontname="hebo", color=NAVY)
        page.add_redact_annot(fitz.Rect(36, 18, 559, 112), fill=WHITE)
        page.add_redact_annot(fitz.Rect(36, 780, 559, 842), fill=WHITE)
        page.apply_redactions()
        text(page, (40, 40, 555, 69), "SÍLABAS MÓVEIS PARA VELCRO", 18, bold=True, color=NAVY, align=fitz.TEXT_ALIGN_CENTER)
        text(page, (40, 70, 555, 89), "Imprima em tamanho real (100%) e recorte no contorno", 9.5, color=MUTED, align=fitz.TEXT_ALIGN_CENTER)
        text(page, (40, 92, 555, 110), f"{AUTHOR} | Jogo {page_no} de 2", 8.3, bold=True, color=ACCENT, align=fitz.TEXT_ALIGN_CENTER)
        page.draw_line((36, 804), (559, 804), color=PINK, width=0.7)
        text(page, (36, 810, 540, 822), f"Material autoral: {AUTHOR}. Todos os direitos reservados.", 7.4, bold=True)
        text(page, (36, 823, 540, 836), LEGAL, 6.8, color=MUTED)
        text(page, (540, 811, 559, 835), f"{page_no}/2", 7.4, bold=True, align=fitz.TEXT_ALIGN_RIGHT)
    doc.set_metadata({
        "title": "Sílabas móveis para velcro | Complete com a Sílaba",
        "author": AUTHOR,
        "subject": "Peças móveis para as 50 fichas de consciência silábica",
        "keywords": "sílabas móveis, velcro, alfabetização",
        "creator": AUTHOR,
    })
    doc.save(output_path, garbage=4, deflate=True, clean=True)


def build_zip(main_pdf: Path, pieces_pdf: Path, output_zip: Path) -> None:
    with zipfile.ZipFile(output_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        archive.write(main_pdf, "01 - Complete com a Silaba - 50 fichas.pdf")
        archive.write(pieces_pdf, "02 - Silabas moveis para velcro.pdf")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--main", type=Path, required=True)
    parser.add_argument("--pieces", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    main_pdf = args.out_dir / "complete-com-a-silaba-margareth-almeida.pdf"
    pieces_pdf = args.out_dir / "silabas-moveis-para-velcro-margareth-almeida.pdf"
    zip_path = args.out_dir / "complete-com-a-silaba-margareth-almeida.zip"
    build_main(args.main, main_pdf)
    build_pieces(args.pieces, pieces_pdf)
    build_zip(main_pdf, pieces_pdf, zip_path)
    print(main_pdf)
    print(pieces_pdf)
    print(zip_path)


if __name__ == "__main__":
    main()
