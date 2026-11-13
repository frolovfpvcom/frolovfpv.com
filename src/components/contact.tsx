"use client";

import { motion } from "motion/react";
import { Mail, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const texts = {
  da: {
    title: "Lad os arbejde sammen",
    lead: "Har du et projekt i tankerne? Jeg vil meget gerne høre om det. Tag fat i mig, så skaber vi noget episk sammen.",
    cta: "Kontakt mig",
  },
  en: {
    title: "Let's work together",
    lead: "Got a project in mind? I'd love to hear about it. Get in touch and let's create something epic together.",
    cta: "Contact me",
  },
};

/** A calm closing panel: heading, one line of text and one button. */
export function Contact() {
  const t = useT(texts);

  return (
    <section id="contact" className="px-4 pb-4 pt-16 md:px-6 md:pb-6 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-6xl rounded-3xl bg-secondary px-6 py-20 text-center md:px-16 md:py-28"
      >
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">{t.title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.lead}</p>
        <GenieLink
          href="/kontakt"
          className="group mt-10 inline-flex h-12 items-center gap-2.5 rounded-full bg-primary px-7 text-base font-medium text-primary-foreground transition-colors hover:bg-skov-700"
        >
          <Mail size={18} />
          {t.cta}
          <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </GenieLink>
      </motion.div>
    </section>
  );
}
