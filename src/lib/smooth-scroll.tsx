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

/* The genie: the page itself, cut to what is on screen, tilts into a funnel and is
   sucked into one point at the top, three quarters of the way across. A beat later the
   new page comes out of the same point and unfolds to fill the screen. Only transform
   and opacity are animated, so it runs on the GPU. The new page is rendered while
   nothing is moving, so React's work never lands in the middle of the animation. */
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

export function SmoothScroll({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<(() => void) | null>(null);
  const stage = useRef<HTMLDivElement>(null);
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
      const el = stage.current;
      if (reduced || !el || !el.animate) {
        router.push(href);
        return;
      }
      if (busy.current) return;
      busy.current = true;
      lenis?.stop();

      // Cut the page to the visible screen and pin the funnel's point to the top of it.
      // Window scrolling stays where it is, so scroll effects on the page don't jump.
      const clip = (top: number) => {
        const below = Math.max(0, el.offsetHeight - top - window.innerHeight);
        el.style.clipPath = `inset(${top}px 0 ${below}px 0 round 28px)`;
        el.style.transformOrigin = `75% ${top}px`;
      };
      clip(window.scrollY);
      el.style.willChange = "transform, opacity";

      // 1. The page is sucked into the point.
      await el.animate(genieOut, { duration: 340, easing: "cubic-bezier(0.55, 0.05, 0.85, 0.3)", fill: "forwards" })
        .finished;

      // 2. While it's gone, the new page renders (it's prefetched, so this is quick).
      const arrived = new Promise<void>((resolve) => {
        pending.current = resolve;
      });
      router.push(href);
      await Promise.race([arrived, wait(2500)]);
      pending.current = null;
      clip(0);

      // 3. The new page comes out of the same point and fills the screen.
      el.getAnimations().forEach((anim) => anim.cancel());
      await el.animate(genieIn, { duration: 420, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" })
        .finished;

      el.getAnimations().forEach((anim) => anim.cancel());
      el.style.clipPath = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
      lenis?.start();
      busy.current = false;
    },
    [pathname, router],
  );

  return (
    <GenieContext.Provider value={navigate}>
      {header}
      {/* the pages and footer; this is what the genie moves, the menu stays put */}
      <div ref={stage} className="flex flex-1 flex-col bg-background">
        {children}
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
