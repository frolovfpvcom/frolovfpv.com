"use client";

import { useEffect, useRef } from "react";
import { ImageIcon, Play } from "lucide-react";
import type { Media } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: { video: "Plads til video", image: "Plads til billede" },
  en: { video: "Space for video", image: "Space for image" },
};

/**
 * Shows a video or picture from `src/lib/media.ts`, or a tidy placeholder
 * while the slot is still empty. Videos only play while on screen.
 */
export function MediaSlot({
  media,
  alt = "",
  kind = "video",
  label,
  className = "",
  controls = false,
  priority = false,
}: {
  media: Media;
  alt?: string;
  /** What the empty slot is meant for. */
  kind?: "video" | "image";
  /** Overrides the placeholder text. */
  label?: string;
  className?: string;
  controls?: boolean;
  priority?: boolean;
}) {
  const t = useT(texts);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || controls) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [controls, media.video]);

  if (media.video) {
    return (
      <video
        ref={ref}
        key={media.video}
        src={media.video}
        poster={media.image}
        muted
        loop
        playsInline
        controls={controls}
        preload={priority ? "auto" : "metadata"}
        aria-label={alt || undefined}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  if (media.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={media.image}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const Icon = kind === "video" ? Play : ImageIcon;
  return (
    <div
      className={`slot-grid flex h-full w-full flex-col items-center justify-center gap-3 bg-surface text-center ${className}`}
    >
      <span className="grid size-12 place-items-center rounded-full border border-foreground/15 text-muted">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
        {label ?? (kind === "video" ? t.video : t.image)}
      </span>
    </div>
  );
}
