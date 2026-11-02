"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Mail, ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";
import { WebShotLayer } from "@/components/ui/web-shot";

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

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const btnBox = useRef<HTMLDivElement>(null);
  const btnLean = useRef<HTMLDivElement>(null);
  const t = useT(texts);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // the panel grows out of the page as it comes into view
  const scale = useTransform(scrollYProgress, [0, 0.7], [0.86, 1]);
  const radius = useTransform(scrollYProgress, [0, 0.7], [80, 36]);
  const words = t.title.split(" ");

  return (
    <section ref={ref} id="contact" className="px-3 pb-3 pt-24 md:px-6 md:pb-6 md:pt-32">
      <motion.div
        ref={panel}
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

        {/* silk threads from the button to the mouse, and the auto-click after 5 s standing still */}
        <WebShotLayer areaRef={panel} targetRef={btnBox} leanRef={btnLean} />

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

          <div className="mt-12 flex justify-center">
            <div ref={btnBox} className="inline-flex">
              <div ref={btnLean} className="inline-flex will-change-transform">
                <GenieLink
                  href="/kontakt"
                  className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full px-8 text-base font-bold text-skov-950 ring-1 ring-inset ring-white/70 backdrop-blur-md transition-transform duration-300 hover:scale-105 active:scale-95 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.3),inset_0_-12px_18px_-10px_rgb(0_0_0/0.14),inset_0_10px_16px_-8px_rgb(255_255_255/0.55),0_14px_32px_-12px_rgb(0_0_0/0.45),0_1px_3px_rgb(0_0_0/0.12)]"
                  style={{ backgroundColor: "color-mix(in oklab, #dbc894 92%, transparent)" }}
                >
                  {/* glass highlights */}
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-[7%] top-[2px] h-[48%] rounded-full bg-gradient-to-b from-white/75 to-white/0" />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-[20%] bottom-[2px] h-[34%] rounded-full bg-gradient-to-t from-white/45 to-white/0 blur-[2px]" />
                  <span className="relative inline-flex items-center gap-3 [text-shadow:0_1px_0_rgb(255_255_255/0.6)]">
                    <Mail size={18} />
                    {t.cta}
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </GenieLink>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
