"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useLang, useT, type Lang } from "@/lib/lang";

const hrefs = ["/arbejde", "/#about", "/kontakt"];

const texts = {
  da: { links: ["Arbejde", "Om mig", "Kontakt"], home: "Til forsiden", open: "Åbn menu", close: "Luk menu", switchTo: "Switch to English" },
  en: { links: ["Work", "About me", "Contact"], home: "To the front page", open: "Open menu", close: "Close menu", switchTo: "Skift til dansk" },
};

/** DA / EN switch; the active language is white, the other grey. */
function LangToggle() {
  const { lang, setLang } = useLang();
  const t = useT(texts);
  const next: Lang = lang === "da" ? "en" : "da";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t.switchTo}
      lang={next}
      className="self-start whitespace-nowrap text-lg font-bold"
    >
      <span className={lang === "da" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}>DA</span>
      <span className="text-neutral-600"> / </span>
      <span className={lang === "en" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}>EN</span>
    </button>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const t = useT(texts);
  const links = hrefs.map((href, i) => ({ href, label: t.links[i] }));

  // Transparent over the intro video; dark once the page scrolls past it.
  // Slides away while scrolling down and comes back when scrolling up or at the top.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (y < 80) setHidden(false);
      else if (Math.abs(y - lastY) > 4) setHidden(y > lastY);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: hidden && !mobileOpen ? "-100%" : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 text-white transition-colors duration-300 ${
        scrolled || mobileOpen ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-[1fr_auto_1fr] items-center">
        <Link href="/" aria-label={t.home} className="justify-self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kat-logo-tiger.png" alt="" className="h-14 w-auto md:h-20" />
        </Link>

        <Link href="/" className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
          FROLOV<span className="text-neutral-400">FPV</span>
        </Link>

        <div className="hidden md:flex items-center gap-10 justify-self-end">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-bold text-white hover:text-neutral-300 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <LangToggle />
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t.close : t.open}
          className="md:hidden text-white justify-self-end"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-bold text-white hover:text-neutral-300 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <LangToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
