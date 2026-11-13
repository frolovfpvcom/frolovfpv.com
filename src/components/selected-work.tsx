"use client";

import { motion } from "motion/react";
import { GenieLink as Link } from "@/lib/smooth-scroll";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Udvalgt arbejde",
    lead: "Lige nu har jeg ikke noget udvalgt arbejde, MEN! Du kan blive den første! Kunne det ikke være lækkert at have din flotte video, som jeg laver for dig, rullende her?",
    more: "Jeg specificerer mig primært i one shots. Dvs gennemflyvning af diverse ejendomme, institutioner osv. Noget som dette er ikke noget man ser meget af her hjemme. Så her er en unik mulighed for dig og dit firma, for at få fat i noget som de fleste andre danske virksomheder ikke har.",
    cta: "Kontakt",
  },
  en: {
    title: "Selected work",
    lead: "Right now I don't have any selected work, BUT! You could be the first! Wouldn't it be great to have the stunning video I make for you rolling right here?",
    more: "I mainly specialise in one-shots, meaning fly-throughs of all kinds of properties, institutions and so on. You don't see much of this here in Denmark, so this is a unique chance for you and your company to get something most other Danish businesses don't have.",
    cta: "Contact",
  },
};

export function SelectedWork() {
  const t = useT(texts);
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-3xl text-center"
    >
      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-8 text-lg md:text-xl leading-relaxed text-foreground/70">{t.lead}</p>
      <p className="mt-6 text-lg md:text-xl leading-relaxed text-foreground/70">{t.more}</p>
      <Link
        href="/kontakt"
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-skov-700"
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
