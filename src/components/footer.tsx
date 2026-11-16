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

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M8 10v7" />
      <circle cx="8" cy="7" r="0.6" fill="currentColor" />
      <path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4" />
      <path d="M12 10v7" />
    </svg>
  );
}

// TODO: Peter's own LinkedIn profile address goes here.
const LINKEDIN_URL = "https://www.linkedin.com/";

export function Footer() {
  const t = useT(texts);
  return (
    <footer className="mx-auto w-full max-w-[1360px] px-5 md:px-10">
      <div className="flex flex-col justify-between gap-3 border-t border-border pb-10 pt-7 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Frolov FPV. {t.rights}
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/cookies" className="hover:text-foreground transition-colors duration-200">
            {t.cookies}
          </Link>
          <a
            href="https://www.instagram.com/frolovfpv/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex items-center gap-2 hover:text-foreground transition-colors duration-200"
          >
            <InstagramIcon />
            @frolovfpv
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex items-center gap-2 hover:text-foreground transition-colors duration-200"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
