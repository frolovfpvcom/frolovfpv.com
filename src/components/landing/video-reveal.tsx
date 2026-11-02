"use client";

import { useEffect, useRef, useState } from "react";
import { cubicBezier, motion, transform, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useT } from "@/lib/lang";
import { useLazyVideo } from "@/lib/lazy-video";

const texts = {
  da: { left: "Ind i", right: "billedet", caption: "Ind i billedet · 4K" },
  en: { left: "Into", right: "the shot", caption: "Into the shot · 4K" },
};

// slow at first, then faster and faster: the pull of getting sucked in
const suck = cubicBezier(0.6, 0, 0.9, 0.35);

// how far into the section the picture has swallowed the screen
const IN = 0.42;

type Opts = { ease?: ((t: number) => number) | ((t: number) => number)[] };
/**
 * Maps scroll progress to a value in plain JS on every frame. Motion would otherwise hand plain
 * opacity/scale mappings to the browser's own scroll timeline, which got the in-between values
 * wrong here (the words came back after they had faded out).
 */
function useMap(p: MotionValue<number>, input: number[], output: number[], opts?: Opts) {
  return useTransform(p, (v) => transform(v, input, output, opts));
}

/**
 * "Ind i billedet": a small window with the clip in it. Scrolling pulls you towards it faster
 * and faster, you fly through the words, warp lines rush past, and the window swallows the
 * whole screen. Only then does the clip start, from the beginning, as if you are now flying it.
 */
export function VideoReveal() {
  const t = useT(texts);
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // loads after the first screen is done (or when it comes close); playing is started below
  useLazyVideo(video, "150%", false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // a phone screen is tall, so its window is a tall card instead of a wide one
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // the window opening up until it is the whole screen
  const insetY = useMap(scrollYProgress, [0, IN], [phone ? 27 : 29, 0], { ease: suck });
  const insetX = useMap(scrollYProgress, [0, IN], [phone ? 16 : 33, 0], { ease: suck });
  const radius = useMap(scrollYProgress, [0, IN], [36, 0], { ease: suck });
  const clipPath = useTransform(
    [insetY, insetX, radius],
    ([y, x, r]) => `inset(${y}% ${x}% ${y}% ${x}% round ${r}px)`,
  );
  // the picture itself rushes towards you, pushes a little past and settles
  const scale = useMap(scrollYProgress, [0, IN, IN + 0.08], [0.7, 1.08, 1], { ease: [suck, (v: number) => v] });

  // flying straight through the words
  const wordsScale = useMap(scrollYProgress, [0, 0.3], [1, 7], { ease: suck });
  const wordsOpacity = useMap(scrollYProgress, [0.14, 0.3], [1, 0]);
  const wordsBlur = useTransform(scrollYProgress, (v) => `blur(${transform(v, [0.12, 0.3], [0, 10])}px)`);

  // warp lines and a dark tunnel edge while you are pulled in
  const warpScale = useMap(scrollYProgress, [0.1, IN], [0.55, 2.4], { ease: suck });
  const warpOpacity = useMap(scrollYProgress, [0.1, 0.28, IN + 0.02], [0, 0.85, 0]);
  const tunnelOpacity = useMap(scrollYProgress, [0.15, 0.36, IN + 0.06], [0, 1, 0]);

  const captionOpacity = useMap(scrollYProgress, [IN + 0.1, IN + 0.18], [0, 1]);

  // the clip waits on its first frame until you are inside it, then runs from the start
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const v = video.current;
    if (!v) return;
    if (p >= IN) {
      if (v.paused) v.play().catch(() => {});
    } else if (p < IN - 0.12 && (!v.paused || v.currentTime > 0)) {
      v.pause();
      v.currentTime = 0;
    }
  });

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div style={{ clipPath }} className="absolute inset-0 will-change-[clip-path]">
          <motion.video
            ref={video}
            style={{ scale }}
            poster="/clips/ind-i-billedet.jpg"
            preload="none"
            muted
            loop
            playsInline
            className="h-full w-full object-cover will-change-transform"
          >
            {/* phones get a lighter 720p file, bigger screens the full 1080p one */}
            <source src="/clips/ind-i-billedet-720.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/clips/ind-i-billedet.mp4" type="video/mp4" />
          </motion.video>
          <div className="absolute inset-0 bg-gradient-to-t from-skov-950/50 via-transparent to-transparent" />
        </motion.div>

        {/* dark tunnel edge */}
        <motion.div
          aria-hidden="true"
          style={{
            opacity: tunnelOpacity,
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(8,7,6,.55) 68%, rgba(8,7,6,.92) 100%)",
          }}
          className="pointer-events-none absolute inset-0"
        />

        {/* warp lines rushing past from the middle */}
        <motion.div
          aria-hidden="true"
          style={{
            scale: warpScale,
            opacity: warpOpacity,
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,227,176,0) 0deg 4.2deg, rgba(255,227,176,.55) 4.5deg 4.8deg, rgba(255,227,176,0) 5.1deg 9deg)",
            maskImage: "radial-gradient(circle at center, transparent 18%, black 46%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle at center, transparent 18%, black 46%, transparent 72%)",
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 size-[150vmax] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        />

        <motion.div
          style={{ opacity: wordsOpacity, scale: wordsScale, filter: wordsBlur }}
          className="pointer-events-none relative z-10 flex w-full flex-col items-center gap-[2vw] px-4 text-[17vw] md:flex-row md:justify-center md:gap-[3vw] md:text-[9vw] font-black uppercase leading-none tracking-tighter text-primary will-change-transform [text-shadow:0_4px_30px_rgba(0,0,0,0.45)]"
        >
          <span>{t.left}</span>
          <span>{t.right}</span>
        </motion.div>

        <motion.p
          style={{ opacity: captionOpacity }}
          className="absolute bottom-10 left-6 md:left-10 z-10 font-mono text-xs uppercase tracking-[0.3em] text-white/85"
        >
          {t.caption}
        </motion.p>
      </div>
    </section>
  );
}
