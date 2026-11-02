"use client";

import { GenieLink as Link } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const texts = {
  da: { rights: "Alle rettigheder forbeholdes.", cookies: "Cookies" },
  en: { rights: "All rights reserved.", cookies: "Cookies" },
};

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
  return (
    <footer className="py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-skov-900/50">
          &copy; {new Date().getFullYear()} Frolov FPV. {t.rights}
        </p>
        <div className="flex items-center gap-6 text-sm text-skov-900/60">
          <Link href="/cookies" className="hover:text-skov-500 transition-colors duration-200">
            {t.cookies}
          </Link>
          <a
            href="https://www.instagram.com/frolovfpv/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex items-center gap-2 hover:text-skov-500 transition-colors duration-200"
          >
            <InstagramIcon />
            @frolovfpv
          </a>
        </div>
      </div>
    </footer>
  );
}
