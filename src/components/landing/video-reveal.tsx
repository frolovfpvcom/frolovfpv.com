"use client";

import { useEffect, useRef, useState } from "react";
import { animate, cubicBezier, motion, transform, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useT } from "@/lib/lang";
import { useLazyVideo } from "@/lib/lazy-video";
import { getLenis } from "@/lib/smooth-scroll";

const texts = {
  da: { left: "Ind i", right: "billedet" },
  en: { left: "Into", right: "the shot" },
};

// slow at first, then faster and faster: the pull of getting sucked in
const suck = cubicBezier(0.6, 0, 0.9, 0.35);

// how long the pull takes, in seconds
const PULL = 1.9;
// where along the pull the window has swallowed the whole screen
const IN = 0.84;

type Opts = { ease?: ((t: number) => number) | ((t: number) => number)[] };
function useMap(p: MotionValue<number>, input: number[], output: number[], opts?: Opts) {
  return useTransform(p, (v) => transform(v, input, output, opts));
}

/**
 * "Ind i billedet": a small window with the clip in it, behind the words. As soon as you reach
 * it, it pulls you in by itself, no more scrolling needed: faster and faster you fly through the
 * words, warp lines rush past, and the window swallows the whole screen. The page holds still
 * while that happens. Then the clip starts from the beginning, as if you are now flying it, and
 * you scroll on. Scrolling back up resets it, so it happens again next time.
 */
export function VideoReveal() {
  const t = useT(texts);
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  // loads after the first screen is done (or when it comes close); playing is started below
  useLazyVideo(video, "150%", false);
  // 0 = small window behind the words, 1 = inside the picture
  const pull = useMotionValue(0);

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
  const insetY = useMap(pull, [0, IN], [phone ? 27 : 29, 0], { ease: suck });
  const insetX = useMap(pull, [0, IN], [phone ? 16 : 33, 0], { ease: suck });
  const radius = useMap(pull, [0, IN], [36, 0], { ease: suck });
  const clipPath = useTransform(
    [insetY, insetX, radius],
    ([y, x, r]) => `inset(${y}% ${x}% ${y}% ${x}% round ${r}px)`,
  );
  // the picture itself rushes towards you, pushes a little past and settles
  const scale = useMap(pull, [0, IN, 1], [0.7, 1.08, 1], { ease: [suck, (v: number) => v] });

  // flying straight through the words
  const wordsScale = useMap(pull, [0, 0.6], [1, 7], { ease: suck });
  const wordsOpacity = useMap(pull, [0.3, 0.6], [1, 0]);
  const wordsBlur = useTransform(pull, (v) => `blur(${transform(v, [0.26, 0.6], [0, 10])}px)`);

  // warp lines and a dark tunnel edge while you are pulled in
  const warpScale = useMap(pull, [0.15, IN], [0.55, 2.4], { ease: suck });
  const warpOpacity = useMap(pull, [0.15, 0.55, 0.88], [0, 0.85, 0]);
  const tunnelOpacity = useMap(pull, [0.25, 0.7, 0.98], [0, 1, 0]);

  useEffect(() => {
    const el = ref.current;
    const v = video.current;
    if (!el || !v) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let state: "out" | "pulling" | "in" = "out";
    let run: ReturnType<typeof animate> | null = null;

    const startClip = () => {
      v.currentTime = 0;
      v.play().catch(() => {});
    };

    const pullIn = () => {
      state = "pulling";
      const lenis = getLenis();
      // bring the window to the middle of the screen and hold the page still while you are pulled in
      lenis?.scrollTo(el, { duration: 0.35, lock: true, force: true, onComplete: () => {
        if (state === "pulling") lenis.stop();
      } });
      run = animate(pull, 1, {
        duration: still ? 0 : PULL,
        ease: "linear",
        onComplete: () => {
          state = "in";
          lenis?.start();
          startClip();
        },
      });
    };

    const reset = () => {
      run?.stop();
      getLenis()?.start();
      state = "out";
      v.pause();
      v.currentTime = 0;
      animate(pull, 0, { duration: 0.5, ease: "easeOut" });
    };

    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const onScreen = r.bottom > 0 && r.top < vh;
      if (state === "out" && onScreen && r.top <= vh * 0.15) {
        if (r.top < -vh * 0.5) {
          // coming back from further down: already inside the picture
          pull.set(1);
          state = "in";
          startClip();
        } else pullIn();
      } else if (state !== "out" && r.top > vh * 0.45) {
        reset();
      } else if (state === "in") {
        // only play while it can be seen
        if (onScreen && v.paused) v.play().catch(() => {});
        if (!onScreen && !v.paused) v.pause();
      }
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      run?.stop();
      getLenis()?.start();
    };
  }, [pull]);

  return (
    <section ref={ref} className="relative h-[200vh]">
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

      </div>
    </section>
  );
}
