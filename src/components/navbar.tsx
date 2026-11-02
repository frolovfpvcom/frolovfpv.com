"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLang, useT, type Lang } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const hrefs = ["/arbejde", "/ommig", "/kontakt"];

const texts = {
  da: { links: ["Arbejde", "Om mig", "Kontakt"], home: "Til forsiden", open: "Åbn menu", close: "Luk menu", switchTo: "Switch to English" },
  en: { links: ["Work", "About me", "Contact"], home: "To the front page", open: "Open menu", close: "Close menu", switchTo: "Skift til dansk" },
};

/** DA / EN switch; the active language is bold, the other faded. */
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
      <span className={lang === "da" ? "" : "opacity-45 hover:opacity-80"}>DA</span>
      <span className="opacity-40"> / </span>
      <span className={lang === "en" ? "" : "opacity-45 hover:opacity-80"}>EN</span>
    </button>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const t = useT(texts);
  const links = hrefs.map((href, i) => ({ href, label: t.links[i] }));
  const home = pathname === "/";

  // No bar behind the menu, ever: logo and links float on top of the page.
  // White over the intro video on the front page, navy everywhere else.
  // Slides away while scrolling down and comes back when scrolling up or at the top.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setOverHero(y < window.innerHeight * 0.8);
      if (y < 80) setHidden(false);
      else if (Math.abs(y - lastY) > 4) setHidden(y > lastY);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const light = home && overHero && !mobileOpen;
  // on phones the video sits below the menu, so the menu is navy there too
  const tone = light ? "text-blaa-950 md:text-white" : "text-blaa-950";
  const accent = light ? "text-blaa-500 md:text-blaa-200" : "text-blaa-500";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: hidden && !mobileOpen ? "-100%" : 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ viewTransitionName: "site-header" }}
      className={`fixed top-0 left-0 right-0 z-50 bg-transparent transition-colors duration-300 ${tone}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-[1fr_auto_1fr] items-center">
        <GenieLink href="/" aria-label={t.home} className="justify-self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kat-logo-tiger.png" alt="" className="h-14 w-auto md:h-20" />
        </GenieLink>

        <GenieLink href="/" className="text-2xl md:text-4xl font-black uppercase tracking-tight">
          FROLOV<span className={`transition-colors duration-300 ${accent}`}>FPV</span>
        </GenieLink>

        <div className="hidden md:flex items-center gap-10 justify-self-end">
          {links.map((link) => (
            <GenieLink
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="group relative text-lg font-bold"
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-[3px] rounded-full bg-current transition-all duration-300 ${
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </GenieLink>
          ))}
          <LangToggle />
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t.close : t.open}
          className="md:hidden justify-self-end"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mx-4 origin-top rounded-3xl bg-white/90 shadow-[0_20px_60px_-20px_rgba(4,84,231,0.45)] backdrop-blur-xl"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {links.map((link) => (
                <GenieLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-xl font-bold text-blaa-950 hover:text-blaa-500 transition-colors"
                >
                  {link.label}
                </GenieLink>
              ))}
              <LangToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
