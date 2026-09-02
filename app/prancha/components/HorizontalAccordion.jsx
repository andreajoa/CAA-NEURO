"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "../prancha.module.css";

const panels = [
  {
    title: "50 fichas",
    body: "Duas fichas por página, com palavras variadas para cada uma das 25 sílabas.",
    image: "/prancha/activity-sorvete.png",
    alt: "Página real com fichas de palavras para completar",
  },
  {
    title: "Sílabas móveis",
    body: "Dois jogos completos para recortar, plastificar e aplicar velcro.",
    image: "/prancha/pieces.png",
    alt: "Folha real das sílabas móveis",
  },
  {
    title: "Gabarito e registro",
    body: "Respostas revisadas e uma ficha de acompanhamento para documentar a mediação.",
    image: "/prancha/gabarito.png",
    alt: "Página real do gabarito revisado",
  },
];

export default function HorizontalAccordion() {
  const [active, setActive] = useState(0);

  return (
    <div className={styles.horizontalAccordion}>
      {panels.map((panel, index) => (
        <button
          type="button"
          key={panel.title}
          className={`${styles.accordionPanel} ${active === index ? styles.accordionPanelActive : ""}`}
          onMouseEnter={() => setActive(index)}
          onFocus={() => setActive(index)}
          onClick={() => setActive(index)}
          aria-expanded={active === index}
        >
          <Image src={panel.image} alt={panel.alt} fill sizes="(max-width: 767px) 92vw, 60vw" />
          <span className={styles.panelScrim} />
          <span className={styles.panelCopy}>
            <strong>{panel.title}</strong>
            <span>{panel.body}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
