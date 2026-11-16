"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** The only motion on the page: a block fades softly in the first time it comes into view. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  // with reduced motion it just appears; same markup either way, so server and browser agree
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
