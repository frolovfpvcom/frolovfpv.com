"use client";

import { useEffect, type RefObject } from "react";

/**
 * Keeps a big clip from fighting the first screen for bandwidth.
 *
 * The <video> starts with preload="none" and no autoPlay, so nothing is downloaded on arrival
 * and the intro video and the pictures at the top get the whole connection. It starts loading
 * once the page has finished loading and gone quiet, or as soon as it gets close to the screen,
 * whichever comes first, and it only plays while it is actually on screen.
 */
export function useLazyVideo(
  ref: RefObject<HTMLVideoElement | null>,
  near = "150%",
  /** false: only take care of loading, the component starts and stops the clip itself */
  autoPlay = true,
) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      v.preload = "auto";
      if (v.networkState === HTMLMediaElement.NETWORK_EMPTY || v.readyState === 0) v.load();
    };

    // close to the screen: start loading
    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { rootMargin: `${near} 0px ${near} 0px` },
    );
    nearIo.observe(v);

    // on screen: play, otherwise pause
    const seenIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          start();
          if (autoPlay) v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
    seenIo.observe(v);

    // or when the first screen is done and the connection is free
    let idle = 0;
    const warm = () => {
      idle = window.setTimeout(start, 2500);
    };
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm, { once: true });

    return () => {
      nearIo.disconnect();
      seenIo.disconnect();
      window.clearTimeout(idle);
      window.removeEventListener("load", warm);
    };
  }, [ref, near, autoPlay]);
}
