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

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> };
};

const GenieContext = createContext<(href: string) => void>(() => {});

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<(() => void) | null>(null);

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

  // A new page starts at the top. Once it has rendered, let the transition open it.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    const done = pending.current;
    if (!done) return;
    pending.current = null;
    requestAnimationFrame(() => done());
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) {
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const doc = document as ViewTransitionDoc;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!doc.startViewTransition || reduced) {
        router.push(href);
        return;
      }
      const html = document.documentElement;
      html.classList.add("genie");
      const transition = doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            pending.current = resolve;
            router.push(href);
            // never hold the screen if the page takes long to arrive
            setTimeout(resolve, 2500);
          }),
      );
      transition.finished.finally(() => html.classList.remove("genie"));
    },
    [pathname, router],
  );

  return <GenieContext.Provider value={navigate}>{children}</GenieContext.Provider>;
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
