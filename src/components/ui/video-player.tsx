"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Play } from "lucide-react";
import { useT } from "@/lib/lang";

const texts = {
  da: { seek: "Spol i videoen", play: "Afspil", pause: "Pause", left: "tilbage" },
  en: { seek: "Seek in the video", play: "Play", pause: "Pause", left: "left" },
};

const clock = (s: number) => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

/* A muted, looping clip with a thin line along the bottom that shows how far it has got,
   and how much time is left. Drag the knob on the line (or anywhere on it) to spool through
   the clip yourself; on phones the knob is always there, on a computer it shows on hover.
   A tap on the picture pauses and plays. */
export function VideoPlayer({
  src,
  mobileSrc,
  poster,
  className,
}: {
  src: string;
  /** A lighter copy for phones. */
  mobileSrc?: string;
  poster?: string;
  className?: string;
}) {
  const t = useT(texts);
  const video = useRef<HTMLVideoElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);
  const resume = useRef(false);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [now, setNow] = useState({ at: 0, of: 0 });

  // Draw the line every frame from the video's own clock, so it glides instead of ticking.
  useEffect(() => {
    let raf = 0;
    let lastSecond = -1;
    const draw = () => {
      const v = video.current;
      if (v && v.duration > 0) {
        const p = v.currentTime / v.duration;
        if (fill.current) fill.current.style.transform = `scaleX(${p})`;
        if (knob.current) knob.current.style.left = `${p * 100}%`;
        const second = Math.floor(v.currentTime);
        if (second !== lastSecond) {
          lastSecond = second;
          if (label.current) label.current.textContent = `-${clock(v.duration - v.currentTime)}`;
          setNow({ at: Math.round(v.currentTime), of: Math.round(v.duration) });
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [src]);

  const seekTo = useCallback((clientX: number) => {
    const v = video.current;
    const el = track.current;
    if (!v || !el || !(v.duration > 0)) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    v.currentTime = p * v.duration;
  }, []);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const v = video.current;
    dragging.current = true;
    setHeld(true);
    resume.current = Boolean(v && !v.paused);
    v?.pause();
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) seekTo(e.clientX);
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    setHeld(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (resume.current) video.current?.play().catch(() => {});
  };

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const step = (seconds: number) => {
    const v = video.current;
    if (v && v.duration > 0) v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + seconds));
  };

  return (
    <div className={`group/player relative h-full w-full ${className ?? ""}`}>
      <video
        ref={video}
        poster={poster}
        onClick={toggle}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        // the whole picture shows, also for clips that aren't 16:9
        className="h-full w-full cursor-pointer object-contain"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        {mobileSrc ? <source src={mobileSrc} type="video/mp4" media="(max-width: 767px)" /> : null}
        <source src={src} type="video/mp4" />
      </video>

      {paused && !held ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={t.play}
          className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md"
        >
          <Play className="ml-0.5 size-6" fill="currentColor" />
        </button>
      ) : null}

      {/* time left, just above the line */}
      <span
        ref={label}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 right-4 font-mono text-[11px] tabular-nums text-white/85 [text-shadow:0_1px_4px_rgb(0_0_0/0.6)]"
      />

      {/* the line: a tall invisible strip to grab, with the thin visible line near its bottom */}
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={t.seek}
        aria-valuemin={0}
        aria-valuemax={now.of}
        aria-valuenow={now.at}
        aria-valuetext={`${clock(now.at)} / ${clock(now.of)}, ${clock(now.of - now.at)} ${t.left}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        // keep the viewer's swipe-between-clips out of it
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(5);
          else if (e.key === "ArrowLeft") step(-5);
          else if (e.key === "Home") step(-Infinity);
          else if (e.key === "End") step(Infinity);
          else return;
          e.preventDefault();
          e.stopPropagation();
        }}
        className="absolute inset-x-4 bottom-0 h-10 cursor-pointer touch-none outline-none [&:focus-visible_.knob]:opacity-100 [&:focus-visible_.knob]:ring-2 [&:focus-visible_.knob]:ring-white/60"
      >
        <div className={`absolute inset-x-0 bottom-3 overflow-hidden rounded-full bg-white/30 transition-[height] duration-150 ${held ? "h-[5px]" : "h-[3px] group-hover/player:h-[5px]"}`}>
          <div ref={fill} className="h-full w-full origin-left bg-white" style={{ transform: "scaleX(0)" }} />
        </div>
        <div
          ref={knob}
          aria-hidden="true"
          className={`knob absolute bottom-[13.5px] -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_1px_6px_rgb(0_0_0/0.45)] transition-[width,height,opacity] duration-150 ${
            held
              ? "size-[22px] opacity-100"
              : "size-4 opacity-0 group-hover/player:opacity-100 [@media(hover:none)]:opacity-100"
          }`}
          style={{ left: "0%" }}
        />
      </div>
    </div>
  );
}
