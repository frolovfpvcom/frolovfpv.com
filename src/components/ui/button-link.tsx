import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-foreground/25 text-foreground hover:border-foreground hover:bg-foreground/5",
  ghost: "text-foreground hover:text-accent px-0",
};

/** Link styled as a button. The primary one is the page's main call to action. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = true,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-7 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-200 active:scale-[0.98] ${styles[variant]} ${className}`}
    >
      {children}
      {arrow ? (
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      ) : null}
    </Link>
  );
}
