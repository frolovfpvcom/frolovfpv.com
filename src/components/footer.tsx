"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { EMAIL } from "@/components/sections/cta-band";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    rights: "Alle rettigheder forbeholdes.",
    tagline: "Filmiske FPV-droneoptagelser til reklamer, events, ejendomme og natur.",
    pages: "Sider",
    contact: "Kontakt",
    links: ["Arbejde", "Ydelser", "Om mig", "Kontakt"],
    cookies: "Cookies",
    top: "Til toppen",
  },
  en: {
    rights: "All rights reserved.",
    tagline: "Cinematic FPV drone footage for commercials, events, real estate and nature.",
    pages: "Pages",
    contact: "Contact",
    links: ["Work", "Services", "About", "Contact"],
    cookies: "Cookies",
    top: "Back to top",
  },
};

const hrefs = ["/arbejde", "/ydelser", "/om", "/kontakt"];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  const t = useT(texts);
  const linkClass = "inline-flex min-h-10 items-center text-muted transition-colors duration-200 hover:text-foreground";
  return (
    <footer className="mt-auto border-t border-line px-5 pt-16 pb-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="display text-4xl tracking-wide">
              Frolov<span className="text-accent">FPV</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t.tagline}</p>
          </div>
          <nav aria-label={t.pages}>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-subtle">{t.pages}</p>
            <ul className="space-y-1 text-sm">
              {hrefs.map((href, i) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {t.links[i]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-subtle">{t.contact}</p>
            <ul className="space-y-1 text-sm">
              <li>
                <a href={`mailto:${EMAIL}`} className={`${linkClass} gap-2`}>
                  <Mail size={16} aria-hidden="true" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/frolovfpv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} gap-2`}
                >
                  <InstagramIcon />
                  @frolovfpv
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Frolov FPV. {t.rights}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/cookies" className="transition-colors hover:text-foreground">
              {t.cookies}
            </Link>
            <a href="#" className="transition-colors hover:text-foreground">
              {t.top} ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
