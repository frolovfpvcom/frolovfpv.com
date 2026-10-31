"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";

/** Big title at the top of the inner pages. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="px-5 pb-16 pt-32 md:px-8 md:pb-20 md:pt-44">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl"
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="display mt-6 text-6xl sm:text-7xl md:text-8xl lg:text-9xl">{title}</h1>
        {lead ? <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{lead}</p> : null}
        {children}
      </motion.div>
    </header>
  );
}
