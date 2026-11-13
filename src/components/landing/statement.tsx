"use client";

import { motion } from "motion/react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    words:
      "FPV-droner kommer helt tæt på. Derhen hvor almindelige droner ikke tør, som får folk til at sige wow.",
    highlight: ["tæt", "wow."],
  },
  en: {
    words:
      "FPV drones get right up close. Where ordinary drones don't dare to go, which makes people say wow.",
    highlight: ["close.", "wow."],
  },
};

/** Peter's headline sentence, big and still. It fades in once; "tæt" and "wow." carry the accent. */
export function Statement() {
  const t = useT(texts);
  const words = t.words.split(" ");

  return (
    <section className="px-6 py-28 md:py-40">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-4xl text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.12]"
      >
        {words.map((w, i) => (
          <span key={i} className={t.highlight.includes(w) ? "text-primary" : undefined}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.p>
    </section>
  );
}
