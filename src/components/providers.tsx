"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { LangProvider } from "@/lib/lang";

/** Language plus motion that calms down when the visitor asks for reduced motion. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LangProvider>
  );
}
