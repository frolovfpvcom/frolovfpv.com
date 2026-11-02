"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Se verden",
    accent: "med nye øjne",
    lead: "FPV-perspektiver, der fortæller historier fra vinkler, du aldrig har set før.",
    down: "Gå til arbejde",
  },
  en: {
    title: "See the world",
    accent: "With new eyes",
    lead: "FPV perspectives that tell stories from angles you have never seen before.",
    down: "Go to work",
  },
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Splits a line into letters that rise into place one after another. */
function Letters({ text, delay }: { text: string; delay: number }) {
  return (
    <span aria-label={text} className="inline-block">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ y: "110%", opacity: 0, rotate: 8 }}
          animate={{ y: "0%", opacity: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: delay + i * 0.035, ease: EASE }}
          className="inline-block whitespace-pre"
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const t = useT(texts);
  const ref = useRef<HTMLElement>(null);
  // As the page scrolls, the video drifts slower than the page and zooms in a touch,
  // while the headline lifts and fades: the next section slides up over it like a curtain.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  // only on desktop, where the video fills the screen; on phones it sits above the text
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-background pt-20 md:bg-skov-950 md:pt-0 md:h-[100svh] md:min-h-[560px]"
    >
      {/* On desktop the intro video fills the whole first screen with the menu and
          text on top. On phones it shows the full 16:9 frame under the menu, with
          the text below, so less of the picture is cropped away. */}
      <motion.div
        style={desktop ? { y: videoY, scale: videoScale } : undefined}
        className="relative md:absolute md:inset-0 will-change-transform"
      >
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          className="relative block aspect-video w-full object-cover md:h-full md:aspect-auto"
        >
          <source src="/intro-4.mp4" type="video/mp4" />
        </motion.video>
      </motion.div>

      {/* Darken the top for the menu and the bottom for the headline. */}
      <div className="absolute inset-x-0 top-0 hidden md:block h-40 bg-gradient-to-b from-skov-950/55 to-transparent" />
      <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-skov-950/80 via-skov-950/15 to-transparent" />

      <motion.div
        style={desktop ? { y: textY, opacity: textOpacity } : undefined}
        className="relative z-10 flex flex-col items-center px-6 pt-10 pb-16 md:h-full md:justify-end md:pt-0 md:pb-24 md:text-white"
      >
        <div className="text-center">
          <h1 className="overflow-hidden text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            <Letters text={t.title} delay={0.3} />
            <br />
            <span className="text-skov-600 md:text-sol-300">
              <Letters text={t.accent} delay={0.6} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
            className="mt-5 text-skov-900/70 md:text-white/85 text-base md:text-lg max-w-md mx-auto"
          >
            {t.lead}
          </motion.p>
        </div>

        <motion.a
          href="#projekter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          aria-label={t.down}
          className="mt-8 grid size-11 place-items-center rounded-full border border-current/30 animate-bounce"
        >
          <ChevronDown size={22} />
        </motion.a>
      </motion.div>
    </section>
  );
}
