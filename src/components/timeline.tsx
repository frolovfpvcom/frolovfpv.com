// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Inline stand-in for @gsap/react's useGSAP. Mirrors its default
   `revertOnUpdate: false`: one gsap.context lives for the component's
   lifetime, the callback is re-added when dependencies change, and the
   context is reverted only on unmount. A callback may return its own
   cleanup, which runs before the next re-add and on unmount. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  }
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

type JourneyItem = {
  id: string;
  year: string;
  month: string;
  content: string;
};

type SplitTextInstance = InstanceType<typeof SplitText>;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);

  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;

  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

// Milestones alternate above and below the line, in date order.
const topJourneyData: JourneyItem[] = [
  {
    id: "2012",
    year: "2012",
    month: "",
    content: "Fik min første fjernstyrede helikopter",
  },
  {
    id: "2022-august",
    year: "2022",
    month: "August",
    content: "Stoppede med modelfly",
  },
  {
    id: "2026-januar",
    year: "2026",
    month: "Januar",
    content: "Fik min første 5\" freestyle-drone",
  },
  {
    id: "2026-november",
    year: "2026",
    month: "November",
    content: "Købte min første cinewhoop og begyndte at filme dronevideoer for alvor",
  },
];

const bottomJourneyData: JourneyItem[] = [
  {
    id: "2018-februar",
    year: "2018",
    month: "Februar",
    content: "Fik min første modelflyver",
  },
  {
    id: "2025-december",
    year: "2025",
    month: "December",
    content: "Købte min første whoop, og så var jeg hooked på FPV",
  },
  {
    id: "2026-juni",
    year: "2026",
    month: "Juni",
    content: "Byggede min første 5\" freestyle-drone helt selv",
  },
];

const allJourneyItems: JourneyItem[] = topJourneyData.flatMap((item, i) =>
  bottomJourneyData[i] ? [item, bottomJourneyData[i]] : [item],
);

const textColor = "var(--foreground)";
const mutedTextColor = "#a3a3a3";
const activeColor = "#ededed";
const duration = 1.2;

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const mutedTextStyle: CSSProperties = { color: mutedTextColor };

  useGSAP(() => {
    const track = trackRef.current;
    const slider = wholeSliderRef.current;

    if (!track || !slider) return;

    const lineWidth = "98%";
    const titleSplits: SplitTextInstance[] = [];

    // Slide the whole track until its right edge meets the viewport.
    const slide = gsap.to(slider, {
      x: () => -(slider.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    if (reducedMotion) {
      gsap.set(".journey-line", { width: lineWidth });
      return;
    }

    gsap.to(".journey-line", {
      width: lineWidth,
      ease: "none",
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    allJourneyItems.forEach((item) => {
      const isTop = topJourneyData.some((topItem) => topItem.id === item.id);

      gsap.set(`.jl-${item.id}`, {
        scaleY: 0,
        transformOrigin: isTop ? "bottom" : "top",
      });
      gsap.set(`.jd-${item.id}`, { scale: 0 });

      const title = new SplitText(`.title-${item.id}`, {
        type: "lines",
        mask: "lines",
      });
      const description = new SplitText(`.description-${item.id}`, {
        type: "lines",
        mask: "lines",
      });
      titleSplits.push(title, description);

      // Each milestone reveals as it travels in from the right edge.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: `.item-${item.id}`,
            containerAnimation: slide,
            start: "left 85%",
            end: "left 45%",
            scrub: true,
          },
        })
        .to(`.jl-${item.id}`, { scaleY: 1, duration: duration * 0.4 })
        .to(`.jd-${item.id}`, { scale: 1, duration: duration * 0.4 }, "<")
        .fromTo(
          title.lines,
          { yPercent: 100 },
          { yPercent: 0, duration, stagger: 0.02, ease: "power2.out" },
          "<0.1",
        )
        .fromTo(
          description.lines,
          { yPercent: 100 },
          { yPercent: 0, duration, stagger: 0.02, ease: "power2.out" },
          "<",
        );
    });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    return () => {
      titleSplits.forEach((split) => split.revert());
      window.removeEventListener("resize", handleResize);
    };
  }, { dependencies: [reducedMotion], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="tidslinje"
      className="relative w-full pt-32"
      style={{ color: textColor }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs text-neutral-500 uppercase tracking-[0.3em] mb-6">
          Tidslinje
        </p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
          Min rejse som FPV drone pilot indtil nu
        </h2>
        <p className="mt-6 text-neutral-400 leading-relaxed">
          Scroll videre og følg turen fra den første helikopter til den første
          selvbyggede 5&quot; freestyle-drone.
        </p>
      </div>

      <div
        ref={trackRef}
        className="h-[250vw] max-[600px]:h-[600vh] w-full relative"
      >
        <div className="h-screen w-full sticky top-0 flex items-center overflow-hidden">
          <div
            ref={wholeSliderRef}
            className="flex h-[30vw] w-[240vw] shrink-0 items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[640vw] max-[600px]:px-[7vw]"
          >
            <div className="h-full w-[30vw] shrink-0 overflow-hidden rounded-[1vw] border border-white/[0.06] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/portrait.jpg"
                alt="Portræt af Peter Frolov"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="relative h-full w-full">
              <div className="w-full absolute left-0 top-[49%] flex items-center h-fit">
                <div
                  className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] shrink-0 rounded-full"
                  style={activeStyle}
                ></div>
                <div
                  className="h-px w-[0%] rounded-full journey-line"
                  style={activeStyle}
                ></div>
                <div
                  className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] shrink-0 rounded-full"
                  style={activeStyle}
                ></div>
              </div>

              <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
                <div className="h-full w-[20%] shrink-0 pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                  <h3 className="w-[80%] text-[2.6vw] font-bold tracking-tight leading-[0.95] max-[600px]:text-[8vw]">
                    Fra helikopter til FPV
                  </h3>
                </div>

                <div className="w-full flex h-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                  {topJourneyData.map((item) => (
                    <div
                      key={`top-${item.id}`}
                      className={`item-${item.id} relative h-full w-[30vw] shrink-0 px-[3vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[7vw]`}
                    >
                      <div className="w-full absolute left-0 bottom-0 top-0 h-full">
                        <div
                          className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative aspect-square rounded-full jd-${item.id}`}
                          style={activeStyle}
                        ></div>
                        <div
                          className={`h-[94%] w-px origin-bottom rounded-full jl-${item.id}`}
                          style={activeStyle}
                        ></div>
                      </div>

                      <div className="mt-[-1vw] space-y-[1vw] max-[600px]:mt-[-2vw]">
                        <h4
                          className={`title-${item.id} text-[2.5vw] font-semibold leading-none max-[600px]:text-[6.4vw]`}
                        >
                          {[item.month, item.year].filter(Boolean).join(" ")}
                        </h4>
                        <p
                          className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:text-[4.8vw]`}
                          style={mutedTextStyle}
                        >
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-1/2 flex items-center justify-start w-full">
                <div className="w-[34%] shrink-0 pt-[2vw] max-[600px]:pt-[5vw] max-[600px]:w-[30%] h-full">
                  <p
                    className="text-[1.65vw] leading-none max-[600px]:text-[4.2vw]"
                    style={mutedTextStyle}
                  >
                    2012–2026
                  </p>
                </div>

                <div className="w-full flex h-full gap-x-[20vw] ml-[7vw] max-[600px]:gap-x-[40vw] max-[600px]:ml-[7vw]">
                  {bottomJourneyData.map((item) => (
                    <div
                      key={`bottom-${item.id}`}
                      className={`item-${item.id} relative h-full w-[25vw] shrink-0 px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]`}
                    >
                      <div className="w-full absolute left-0 bottom-[-1%] h-full">
                        <div
                          className={`h-[94%] origin-top w-px rounded-full max-[600px]:h-full jl-${item.id}`}
                          style={activeStyle}
                        ></div>
                        <div
                          className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative aspect-square rounded-full jd-${item.id}`}
                          style={activeStyle}
                        ></div>
                      </div>

                      <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">
                        <h4
                          className={`title-${item.id} text-[2.5vw] font-semibold leading-none max-[600px]:text-[6.4vw]`}
                        >
                          {[item.month, item.year].filter(Boolean).join(" ")}
                        </h4>
                        <p
                          className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:text-[4.8vw]`}
                          style={mutedTextStyle}
                        >
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
