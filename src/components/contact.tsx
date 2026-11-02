"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
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

/** A button that leans toward the cursor when it comes close. */
function MagneticButton({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15 });
  const sy = useSpring(y, { stiffness: 220, damping: 15 });
  return (
    <motion.div
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.35);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="inline-block p-4 -m-4"
    >
      {children}
    </motion.div>
  );
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const t = useT(texts);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // the panel grows out of the page as it comes into view
  const scale = useTransform(scrollYProgress, [0, 0.7], [0.86, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.7], [80, 36]);
  const words = t.title.split(" ");

  return (
    <section ref={ref} id="contact" className="px-3 pb-3 pt-24 md:px-6 md:pb-6 md:pt-32">
      <motion.div
        style={{ scale, borderRadius: radius }}
        className="relative overflow-hidden bg-gradient-to-br from-skov-700 via-skov-800 to-skov-950 px-6 py-24 text-white md:px-16 md:py-36"
      >
        {/* bright clouds drifting around in the panel */}
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-sol-300/35 blur-3xl"
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-32 right-0 size-[28rem] rounded-full bg-ild-500/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95]">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
                <motion.span
                  initial={{ y: "105%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block mr-[0.22em]"
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-8 max-w-xl text-lg md:text-xl leading-relaxed text-white/85"
          >
            {t.lead}
          </motion.p>

          <div className="mt-12">
            <MagneticButton>
              <GenieLink
                href="/kontakt"
                className="group inline-flex items-center gap-3 rounded-full bg-sol-400 px-8 py-4 text-base font-bold text-skov-950 shadow-[0_20px_50px_-15px_rgba(13,28,9,0.5)] transition-transform duration-300 hover:scale-105"
              >
                <Mail size={18} />
                {t.cta}
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </GenieLink>
            </MagneticButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
