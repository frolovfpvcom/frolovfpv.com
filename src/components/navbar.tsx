"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLang, useT, type Lang } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";

const hrefs = ["/arbejde", "/ommig", "/kontakt"];

const texts = {
  da: { links: ["Arbejde", "Om mig", "Kontakt"], home: "Til forsiden", open: "Åbn menu", close: "Luk menu", switchTo: "Switch to English" },
  en: { links: ["Work", "About me", "Contact"], home: "To the front page", open: "Open menu", close: "Close menu", switchTo: "Skift til dansk" },
};

/** DA / EN switch; the active language is dark, the other faded. */
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
      className="self-start whitespace-nowrap text-sm text-muted-foreground"
    >
      <span className={lang === "da" ? "text-foreground" : "hover:text-foreground"}>DA</span>
      <span className="opacity-50"> / </span>
      <span className={lang === "en" ? "text-foreground" : "hover:text-foreground"}>EN</span>
    </button>
  );
}

/* A bar that stays at the top. On the front page it starts see-through with white text on top
   of the full-screen intro video, and turns into the plain white bar once the video is passed.
   Elsewhere it is white from the start; a thin line shows under it once the page has scrolled. */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();
  const t = useT(texts);
  const links = hrefs.map((href, i) => ({ href, label: t.links[i] }));

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setPastHero(window.scrollY > window.innerHeight - 90);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // white text straight on the video, until the video has scrolled past
  const onVideo = pathname === "/" && !pastHero && !mobileOpen;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color] duration-300 ${
        onVideo
          ? "border-transparent bg-transparent text-white [--muted-foreground:rgb(255_255_255/0.8)] [--foreground:#fff]"
          : `bg-background/90 backdrop-blur-md ${scrolled || mobileOpen ? "border-border" : "border-transparent"}`
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-5 md:h-20 md:px-10">
        <GenieLink href="/" aria-label={t.home} className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/kat-logo-tiger.png"
            alt=""
            className={`h-10 w-auto transition-[filter] duration-300 md:h-11 ${onVideo ? "invert" : ""}`}
          />
          <span className="text-[15px] font-semibold tracking-tight">Frolov FPV</span>
        </GenieLink>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <GenieLink
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-[15px] transition-colors ${
                  active ? "text-foreground underline underline-offset-[6px]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </GenieLink>
            );
          })}
          <LangToggle />
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t.close : t.open}
          aria-expanded={mobileOpen}
          className="md:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-5 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <GenieLink
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-3xl"
              >
                {link.label}
              </GenieLink>
            ))}
            <LangToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
