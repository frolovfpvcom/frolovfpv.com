"use client";

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full bg-black flex flex-col">
      <div className="h-20" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-4 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl aspect-[16/8] rounded-2xl overflow-hidden shadow-2xl shadow-white/[0.03] border border-white/[0.06]"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </motion.div>

        <div className="mt-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight"
          >
            Se verden
            <br />
            <span className="text-neutral-500">med nye øjne</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-neutral-500 text-base md:text-lg max-w-md mx-auto"
          >
            FPV-perspektiver, der fortæller historier fra vinkler, du aldrig har set før.
          </motion.p>
        </div>

        <motion.a
          href="#work"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-label="Gå til arbejde"
          className="mt-10 animate-bounce"
        >
          <ChevronDown size={24} className="text-neutral-600" />
        </motion.a>
      </div>
    </section>
  );
}
