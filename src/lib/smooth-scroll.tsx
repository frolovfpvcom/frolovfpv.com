"use client";

import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type MouseEvent,
} from "react";

/* Blød scroll (Lenis) for hele siden og "genie"-sideskiftet mellem menuens sider. */

let lenis: Lenis | null = null;

/* The genie: the page turns into a plain white sheet that tilts into a funnel and is
   sucked into one point at the top, three quarters of the way across. A beat later the
   new page's sheet comes out of the same point and unfolds to fill the screen, then
   fades to show the page. Only a blank sheet moves, and only by transform and opacity,
   so the animation runs on the GPU and keeps going while the new page renders. */
const GENIE_ORIGIN = "75% 0%";
const P = "perspective(1400px)";
const genieOut: Keyframe[] = [
  { offset: 0, transform: `scale(1, 1) ${P} rotateX(0deg)`, opacity: 1 },
  { offset: 0.4, transform: `scale(0.62, 0.7) ${P} rotateX(38deg)`, opacity: 1 },
  { offset: 0.75, transform: `scale(0.16, 0.3) ${P} rotateX(52deg)`, opacity: 1 },
  { offset: 1, transform: `scale(0, 0) ${P} rotateX(52deg)`, opacity: 0 },
];
const genieIn: Keyframe[] = genieOut.map((k) => ({ ...k, offset: 1 - (k.offset as number) })).reverse();

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const GenieContext = createContext<(href: string) => void>(() => {});

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<(() => void) | null>(null);
  const cover = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ autoRaf: true, anchors: { offset: -40 }, lerp: 0.11 });
    lenis = instance;
    // Pop-ups lock the page by hiding the body's overflow; pause the smooth scroll meanwhile.
    const lock = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") instance.stop();
      else instance.start();
    });
    lock.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      lock.disconnect();
      instance.destroy();
      lenis = null;
    };
  }, []);

  // Have every page ready before anyone clicks, so the switch never waits on the network.
  useEffect(() => {
    ["/", "/arbejde", "/ommig", "/kontakt"].forEach((href) => router.prefetch(href));
  }, [router]);

  // A new page starts at the top. Once it has rendered and the pictures at the top
  // are decoded, let the transition open it, so it unfolds as a finished page.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    const done = pending.current;
    if (!done) return;
    pending.current = null;
    const visible = Array.from(document.images).filter(
      (img) => img.getBoundingClientRect().top < window.innerHeight,
    );
    const ready = Promise.all(visible.map((img) => img.decode().catch(() => {})));
    const cap = wait(350);
    Promise.race([ready, cap]).then(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => done())),
    );
  }, [pathname]);

  const navigate = useCallback(
    async (href: string) => {
      if (href === pathname) {
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coverEl = cover.current;
      const sheetEl = sheet.current;
      if (reduced || !coverEl || !sheetEl || !coverEl.animate) {
        router.push(href);
        return;
      }
      if (busy.current) return;
      busy.current = true;

      // 1. The page goes white.
      coverEl.style.display = "block";
      await coverEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 90, fill: "forwards" }).finished;

      // 2. Load the new page behind the cover while the white sheet is sucked away.
      const arrived = new Promise<void>((resolve) => {
        pending.current = resolve;
      });
      router.push(href);
      const out = sheetEl.animate(genieOut, {
        duration: 320,
        easing: "cubic-bezier(0.55, 0.05, 0.85, 0.3)",
        fill: "forwards",
      });
      await Promise.all([out.finished, Promise.race([arrived, wait(2500)])]);
      pending.current = null;

      // 3. Gone for a moment, then the sheet comes back out of the same point and fills the screen.
      await wait(60);
      out.cancel();
      await sheetEl.animate(genieIn, {
        duration: 360,
        easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
        fill: "forwards",
      }).finished;

      // 4. The white fades away and the new page is there.
      await coverEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-out", fill: "forwards" })
        .finished;
      coverEl.getAnimations().forEach((a) => a.cancel());
      sheetEl.getAnimations().forEach((a) => a.cancel());
      coverEl.style.display = "none";
      busy.current = false;
    },
    [pathname, router],
  );

  return (
    <GenieContext.Provider value={navigate}>
      {children}
      {/* the white cover for the page switch; sits under the menu so the menu stays put */}
      <div ref={cover} aria-hidden="true" className="fixed inset-0 z-40 hidden" style={{ opacity: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 40% at 75% 0%, rgba(247,193,42,.4) 0%, rgba(247,193,42,0) 70%), #faf7ec",
          }}
        />
        <div
          ref={sheet}
          className="absolute inset-0 rounded-[28px] bg-white shadow-[0_30px_80px_-30px_rgba(24,46,16,0.45)]"
          style={{ transformOrigin: GENIE_ORIGIN, willChange: "transform, opacity", backfaceVisibility: "hidden" }}
        />
      </div>
    </GenieContext.Provider>
  );
}

/** A link to one of the site's own pages that opens it with the genie transition. */
export function GenieLink({ href, onClick, ...props }: ComponentProps<typeof NextLink> & { href: string }) {
  const navigate = useContext(GenieContext);
  return (
    <NextLink
      href={href}
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
