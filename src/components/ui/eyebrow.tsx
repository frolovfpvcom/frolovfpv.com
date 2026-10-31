import type { ReactNode } from "react";

/** Small mono label above a heading, like an OSD readout in the goggles. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted ${className}`}>
      <span aria-hidden="true" className="h-px w-8 bg-accent" />
      {children}
    </p>
  );
}
