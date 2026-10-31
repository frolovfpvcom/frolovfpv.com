"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang, useT, type Lang } from "@/lib/lang";

const hrefs = ["/arbejde", "/ydelser", "/om"];

const texts = {
  da: {
    links: ["Arbejde", "Ydelser", "Om mig"],
    cta: "Kontakt",
    ctaLong: "Book en flyvning",
    home: "Frolov FPV, til forsiden",
    open: "Åbn menu",
    close: "Luk menu",
    nav: "Hovedmenu",
    switchTo: "Switch to English",
    skip: "Spring til indhold",
  },
  en: {
    links: ["Work", "Services", "About"],
    cta: "Contact",
    ctaLong: "Book a flight",
    home: "Frolov FPV, to the front page",
    open: "Open menu",
    close: "Close menu",
    nav: "Main menu",
    switchTo: "Skift til dansk",
    skip: "Skip to content",
  },
};

/** DA / EN switch; the active language is white, the other grey. */
function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  const t = useT(texts);
  const next: Lang = lang === "da" ? "en" : "da";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t.switchTo}
      lang={next}
      className={`min-h-11 whitespace-nowrap font-mono text-sm font-semibold tracking-wider ${className}`}
    >
      <span className={lang === "da" ? "text-foreground" : "text-subtle hover:text-muted"}>DA</span>
      <span className="text-white/25"> / </span>
      <span className={lang === "en" ? "text-foreground" : "text-subtle hover:text-muted"}>EN</span>
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const t = useT(texts);
  const links = hrefs.map((href, i) => ({ href, label: t.links[i] }));
  // the menu closes by itself when the page changes
  const mobileOpen = openOn === pathname;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Transparent over the front-page video; dark everywhere else and once scrolled.
  // Slides away while scrolling down and comes back when scrolling up or at the top.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y < 80) setHidden(false);
      else if (Math.abs(y - lastY) > 4) setHidden(y > lastY);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const solid = scrolled || mobileOpen || pathname !== "/";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: hidden && !mobileOpen ? "-100%" : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-line bg-background/85 backdrop-blur-md" : "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        {t.skip}
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-20 md:px-8">
        <Link href="/" aria-label={t.home} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kat-logo-tiger.png" alt="" className="h-10 w-auto md:h-12" />
          <span className="display text-2xl tracking-wide md:text-[1.7rem]">
            Frolov<span className="text-accent">FPV</span>
          </span>
        </Link>

        <nav aria-label={t.nav} className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`relative py-2 text-sm font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${
                isActive(link.href) ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
              {isActive(link.href) ? (
                <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-accent" />
              ) : null}
            </Link>
          ))}
          <LangToggle />
          <Link
            href="/kontakt"
            aria-current={isActive("/kontakt") ? "page" : undefined}
            className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold uppercase tracking-[0.08em] text-on-accent transition-colors hover:bg-accent-hover"
          >
            {t.ctaLong}
            <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpenOn(mobileOpen ? null : pathname)}
          aria-label={mobileOpen ? t.close : t.open}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="-mr-2 grid size-11 place-items-center md:hidden"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label={t.nav}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-[calc(100dvh-4rem)] flex-col justify-between border-t border-line bg-background px-5 pb-10 pt-8 md:hidden"
          >
            <ul className="space-y-1">
              {[...links, { href: "/kontakt", label: t.cta }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`display block py-2 text-5xl ${isActive(link.href) ? "text-accent" : "text-foreground"}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-6">
              <LangToggle />
              <Link
                href="/kontakt"
                className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-semibold uppercase tracking-[0.08em] text-on-accent"
              >
                {t.ctaLong}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
