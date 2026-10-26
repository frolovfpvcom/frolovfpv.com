"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import { useT } from "@/lib/lang";

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
import { Mail, ArrowUpRight } from "lucide-react";

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = useT(texts);

  return (
    <section id="contact" className="py-32 px-6 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t.title}
          </h2>
          <p className="text-neutral-400 text-lg leading-relaxed mb-10">
            {t.lead}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/kontakt"
              className="group flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-full font-medium text-sm hover:bg-neutral-200 transition-colors duration-200"
            >
              <Mail size={16} />
              {t.cta}
              <ArrowUpRight
                size={14}
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
