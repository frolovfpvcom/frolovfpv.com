"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Arbejde", href: "#work" },
  { label: "Om mig", href: "#about" },
  { label: "Tidslinje", href: "#tidslinje" },
  { label: "Kontakt", href: "#contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-white text-black border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 grid grid-cols-[1fr_auto_1fr] items-center">
        <a href="#" aria-label="Til toppen" className="justify-self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kat-logo.png" alt="" className="h-10 w-auto md:h-12" />
        </a>

        <a href="#" className="text-lg font-semibold tracking-tight text-black">
          FROLOV<span className="text-neutral-500">FPV</span>
        </a>

        <div className="hidden md:flex items-center gap-8 justify-self-end">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-700 hover:text-black transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Luk menu" : "Åbn menu"}
          className="md:hidden text-black justify-self-end"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-black/5 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-neutral-700 hover:text-black transition-colors"
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
