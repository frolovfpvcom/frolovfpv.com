"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LiquidNavbar, NimbusIcons, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar";
import { useGenieNavigate } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const PENCIL = "M5.5 15.5 9 13.6h13.3a1.2 1.2 0 0 1 1.2 1.2v1.4a1.2 1.2 0 0 1-1.2 1.2H9Z";

/** Folder with a ruler and a pencil across it, drawn in the same stroke style as the other icons.
    `id` keeps the masks apart when the menu is on the page twice (phone dock + computer bar). */
const folderIcon = (id: string) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <defs>
      {/* gaps in the folder and the ruler where the tools lie on top of them */}
      <mask id={`${id}-cut-folder`} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#fff" stroke="none" />
        <g fill="#000" stroke="#000" strokeWidth="3.6">
          <rect x="7" y="13.5" width="17" height="4" rx="0.8" transform="rotate(45 15.5 15.5)" />
          <path d={PENCIL} transform="rotate(-45 14.5 15.5)" />
        </g>
      </mask>
      <mask id={`${id}-cut-ruler`} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#fff" stroke="none" />
        <path d={PENCIL} transform="rotate(-45 14.5 15.5)" fill="#000" stroke="#000" strokeWidth="3.6" />
      </mask>
    </defs>
    {/* folder */}
    <g mask={`url(#${id}-cut-folder)`}>
      <path d="M2 15.8V4a1.2 1.2 0 0 1 1.2-1.2h4.6l1.9 2.1h10.1a1.2 1.2 0 0 1 1.2 1.2v9.7a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 15.8Z" />
      <path d="M2 7.8h19M4.6 10.6h4.6M4.6 13.4h3.2" />
    </g>
    {/* ruler */}
    <g mask={`url(#${id}-cut-ruler)`}>
      <g transform="rotate(45 15.5 15.5)">
        <rect x="7" y="13.5" width="17" height="4" rx="0.8" />
        <path d="M10 13.5v1.7M12.5 13.5v1.1M18.5 13.5v1.1M21 13.5v1.7" strokeWidth="1.3" />
      </g>
    </g>
    {/* pencil, tip down to the left */}
    <g transform="rotate(-45 14.5 15.5)">
      <path d={PENCIL} />
      <path d="M9 13.6v3.8M20.6 13.6v3.8" />
    </g>
  </svg>
);

/** Quadcopter seen from above; it still gets the "plane" animation and flies off when tapped. */
const droneIcon = (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="5.6" cy="5.6" r="3.3" />
    <circle cx="18.4" cy="5.6" r="3.3" />
    <circle cx="5.6" cy="18.4" r="3.3" />
    <circle cx="18.4" cy="18.4" r="3.3" />
    <path d="M5.6 5.6 18.4 18.4M18.4 5.6 5.6 18.4" />
    <path d="M12 8.9 15.1 12 12 15.1 8.9 12Z" fill="currentColor" />
    <g fill="currentColor" stroke="none">
      <circle cx="5.6" cy="5.6" r="1.1" />
      <circle cx="18.4" cy="5.6" r="1.1" />
      <circle cx="5.6" cy="18.4" r="1.1" />
      <circle cx="18.4" cy="18.4" r="1.1" />
    </g>
  </svg>
);

const hrefs = ["/", "/arbejde", "/kontakt", "/ommig"];

const texts = {
  da: { labels: ["Forside", "Arbejde", "Kontakt", "Om mig"], nav: "Menu" },
  en: { labels: ["Home", "Work", "Contact", "About me"], nav: "Menu" },
};

const indexFor = (path: string) => {
  const i = hrefs.indexOf(path);
  return i === -1 ? 0 : i;
};

/**
 * The liquid-glass menu itself: icons only on a phone, icons with names on a computer.
 */
export function SiteDock({ id, compact, className }: { id: string; compact: boolean; className?: string }) {
  const pathname = usePathname();
  const navigate = useGenieNavigate();
  const t = useT(texts);
  // Move the water drop right away on tap; the page follows after the transition.
  const [active, setActive] = useState(() => indexFor(pathname));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the route (back button etc.)
    setActive(indexFor(pathname));
  }, [pathname]);

  const icons = [NimbusIcons.home, folderIcon(id), droneIcon, NimbusIcons.user];
  const fx: LiquidNavItem["fx"][] = ["glow", "pop", "plane", "wave"];
  const items: LiquidNavItem[] = hrefs.map((href, i) => ({ href, label: t.labels[i], icon: icons[i], fx: fx[i] }));

  return (
    <LiquidNavbar
      tone="light"
      compact={compact}
      items={items}
      active={active}
      onChange={(i) => setActive(i)}
      onNavigate={navigate}
      ariaLabel={t.nav}
      className={className}
    />
  );
}

/**
 * Fixed at the bottom of the screen, phones only (hidden from md up).
 * Takes 5/6 of the screen width, centred. On a computer the same menu sits in the top bar.
 */
export function MobileDock() {
  return (
    <div className="mobile-dock fixed inset-x-[8.333%] bottom-[max(14px,env(safe-area-inset-bottom))] z-50 md:hidden">
      <SiteDock id="dock" compact className="w-full" />
    </div>
  );
}
