"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Arbejde", href: "#work" },
  { label: "Om mig", href: "#about" },
  { label: "Kontakt", href: "#contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Transparent over the intro video; dark once the page scrolls past it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 text-white transition-colors duration-300 ${
        scrolled || mobileOpen ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-[1fr_auto_1fr] items-center">
        <a href="#" aria-label="Til toppen" className="justify-self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kat-logo-tiger.png" alt="" className="h-14 w-auto md:h-20" />
        </a>

        <a href="#" className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
          FROLOV<span className="text-neutral-400">FPV</span>
        </a>

        <div className="hidden md:flex items-center gap-10 justify-self-end">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-lg font-bold text-white hover:text-neutral-300 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Luk menu" : "Åbn menu"}
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
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-bold text-white hover:text-neutral-300 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
