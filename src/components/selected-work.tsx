"use client";

import { motion } from "motion/react";
import { GenieLink as Link } from "@/lib/smooth-scroll";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Udvalgt arbejde",
    lead: "Lige nu har jeg ikke noget udvalgt arbejde, MEN! Du kan blive den første! Kunne det ikke være lækkert at have din flotte video, som jeg laver for dig, rullende her?",
    cta: "Kontakt",
  },
  en: {
    title: "Selected work",
    lead: "Right now I don't have any selected work, BUT! You could be the first! Wouldn't it be great to have the stunning video I make for you rolling right here?",
    cta: "Contact",
  },
};

export function SelectedWork() {
  const t = useT(texts);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-3xl text-center"
    >
      <h1 className="text-5xl md:text-7xl font-black tracking-tight">{t.title}</h1>
      <p className="mt-8 text-lg md:text-xl leading-relaxed text-blaa-950/70">{t.lead}</p>
      <Link
        href="/kontakt"
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-blaa-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_15px_35px_-15px_rgba(4,84,231,0.9)] transition-all duration-300 hover:scale-105 hover:bg-blaa-600"
      >
        {t.cta}
        <ArrowUpRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </motion.div>
  );
}
