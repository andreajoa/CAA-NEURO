"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "../prancha.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const stages = [
  {
    title: "Observe a palavra",
    body: "A criança identifica as partes que já estão impressas e percebe onde a sílaba precisa entrar.",
    image: "/prancha/activity-doente.png",
    alt: "Ficha real do material com a palavra DOENTE para completar",
    tone: "peach",
  },
  {
    title: "Complete com a peça",
    body: "A sílaba móvel transforma a resposta em uma ação concreta, com tentativa, ajuste e confirmação visual.",
    image: "/prancha/pieces.png",
    alt: "Página real com as sílabas móveis para recortar",
    tone: "blue",
  },
  {
    title: "Leia e registre",
    body: "Depois de formar a palavra, a criança lê em voz alta e o adulto acompanha o nível de ajuda necessário.",
    image: "/prancha/gabarito.png",
    alt: "Gabarito real das fichas do material",
    tone: "yellow",
  },
];

export default function StickyMethod() {
  const root = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(`.${styles.methodCard}`, root.current);
      const media = gsap.matchMedia();

      media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card, index) => {
          if (index === cards.length - 1) return;

          ScrollTrigger.create({
            trigger: card,
            start: "top top",
            endTrigger: cards[cards.length - 1],
            end: "top top",
            pin: true,
            pinSpacing: false,
          });

          gsap.to(card, {
            scale: 0.94,
            opacity: 0.34,
            ease: "none",
            scrollTrigger: {
              trigger: cards[index + 1],
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          });
        });
      });

      return () => media.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className={styles.methodStack}>
      {stages.map((stage) => (
        <article key={stage.title} className={`${styles.methodCard} ${styles[stage.tone]}`}>
          <div className={styles.methodCopy}>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
          </div>
          <div className={styles.methodVisual}>
            <Image src={stage.image} alt={stage.alt} fill sizes="(max-width: 767px) 92vw, 50vw" />
          </div>
        </article>
      ))}
    </div>
  );
}
