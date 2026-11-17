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

/* Blød scroll (Lenis) for hele siden og et kort, blødt fade mellem menuens sider. */

let lenis: Lenis | null = null;

/* The page fades out, the new page renders while nothing is shown, and it fades in.
   Only opacity is animated, so it runs on the GPU. */
const fadeOut: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];
const fadeIn: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];

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
    // a link like /#ydelser lands on that section; everything else starts at the top
    const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (target) {
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true, offset: -40 });
      else target.scrollIntoView();
    } else lenis?.scrollTo(0, { immediate: true, force: true });
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
      const [path, hash] = href.split("#");
      // a section on the page we're already on: just glide down to it
      if (hash && (path || "/") === pathname) {
        const target = document.getElementById(hash);
        if (target) {
          if (lenis) lenis.scrollTo(target, { offset: -40 });
          else target.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
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

      el.style.willChange = "opacity";

      // 1. The page fades out.
      await el.animate(fadeOut, { duration: 160, easing: "ease-out", fill: "forwards" }).finished;

      // 2. While it's gone, the new page renders (it's prefetched, so this is quick).
      const arrived = new Promise<void>((resolve) => {
        pending.current = resolve;
      });
      router.push(href);
      await Promise.race([arrived, wait(2500)]);
      pending.current = null;

      // 3. The new page fades in.
      el.getAnimations().forEach((anim) => anim.cancel());
      el.style.opacity = "0";
      await el.animate(fadeIn, { duration: 240, easing: "ease-out", fill: "forwards" }).finished;

      el.getAnimations().forEach((anim) => anim.cancel());
      el.style.opacity = "";
      el.style.willChange = "";
      lenis?.start();
      busy.current = false;
    },
    [pathname, router],
  );

  return (
    <GenieContext.Provider value={navigate}>
      {header}
      {/* the pages and footer; this is what fades, the menu stays put */}
      <div ref={stage} className="flex flex-1 flex-col bg-background">
        {children}
      </div>
    </GenieContext.Provider>
  );
}

/** A link to one of the site's own pages that opens it with the fade. */
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

/** Opens one of the site's own pages with the page transition (for links that aren't a GenieLink). */
export function useGenieNavigate() {
  return useContext(GenieContext);
}
