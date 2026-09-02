"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "../prancha.module.css";

const prompts = [
  {
    title: "Pronuncie devagar",
    body: "Alongue a palavra e ajude a criança a perceber cada parte antes de escolher a peça.",
  },
  {
    title: "Bata palmas",
    body: "Marque uma palma para cada sílaba e torne a segmentação audível e corporal.",
  },
  {
    title: "Registre a mediação",
    body: "Anote quando houve ajuda verbal, gestual ou física para acompanhar a evolução.",
  },
];

export default function PracticeCarousel() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  function move(direction) {
    setIndex((current) => (current + direction + prompts.length) % prompts.length);
  }

  return (
    <div className={styles.practiceCarousel}>
      <div className={styles.carouselViewport}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={prompts[index].title}
            className={styles.practiceSlide}
            initial={reduceMotion ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3>{prompts[index].title}</h3>
            <p>{prompts[index].body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className={styles.carouselControls}>
        <span>{index + 1} de {prompts.length}</span>
        <button type="button" onClick={() => move(-1)} aria-label="Orientação anterior">
          <ArrowLeft aria-hidden="true" />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Próxima orientação">
          <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
