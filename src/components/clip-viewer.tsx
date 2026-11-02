"use client";

import { animate, AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FolderFile } from "@/components/ui/glass-folder-cards";
import { useT } from "@/lib/lang";

const texts = {
  da: { from: "fra", close: "Luk", prev: "Forrige klip", next: "Næste klip", clip: "Klip", of: "af", show: "Vis" },
  en: { from: "from", close: "Close", prev: "Previous clip", next: "Next clip", clip: "Clip", of: "of", show: "Show" },
};

export type ClipSelection = {
  files: FolderFile[];
  index: number;
  folder: string;
  /** The card that was tapped; the viewer grows out of it and shrinks back into it. */
  origin: HTMLElement | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Transform that lays the panel over the origin card. */
function fromOrigin(panel: HTMLElement, origin: HTMLElement | null) {
  const to = panel.getBoundingClientRect();
  const from = origin?.getBoundingClientRect();
  if (!from || from.width === 0) return { x: 0, y: 24, scale: 0.92 };
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale: from.width / to.width,
  };
}

export function ClipViewer({
  selection,
  onClose,
}: {
  selection: ClipSelection | null;
  onClose: () => void;
}) {
  // only ever set from a tap, so this never renders on the server
  if (!selection) return null;
  return createPortal(<Viewer key={selection.folder} selection={selection} onClose={onClose} />, document.body);
}

function Viewer({ selection, onClose }: { selection: ClipSelection; onClose: () => void }) {
  const { files, folder, origin } = selection;
  const t = useT(texts);
  const [index, setIndex] = useState(selection.index);
  const [dir, setDir] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const file = files[index];
  const many = files.length > 1;

  // grow out of the tapped card
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;
    const { x, y, scale } = fromOrigin(panel, origin);
    animate(backdrop, { opacity: [0, 1] }, { duration: 0.35, ease: "easeOut" });
    animate(
      panel,
      { x: [x, 0], y: [y, 0], scale: [scale, 1], opacity: [0, 1], borderRadius: [`${14 / scale}px`, "22px"] },
      { duration: 0.55, ease: EASE, opacity: { duration: 0.2 } },
    );
    closeRef.current?.focus({ preventScroll: true });
    // the selection is fixed for this viewer's life
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // …and shrink back into it (or just fade if another clip is showing)
  const close = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (panel && backdrop) {
      const back = index === selection.index ? origin : null;
      const { x, y, scale } = fromOrigin(panel, back);
      await Promise.all([
        animate(backdrop, { opacity: 0 }, { duration: 0.3, ease: "easeIn" }),
        animate(
          panel,
          { x, y, scale, opacity: back ? [1, 1, 0] : 0 },
          { duration: back ? 0.4 : 0.25, ease: [0.4, 0, 0.2, 1] },
        ),
      ]);
    }
    onClose();
  }, [index, origin, onClose, selection.index]);

  const go = useCallback(
    (step: number) => {
      if (!many) return;
      setDir(step);
      setIndex((i) => (i + step + files.length) % files.length);
    },
    [many, files.length],
  );

  // keys win over the folder's own Escape handler, which listens on document
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // keep focus inside the dialog
        const nodes = panelRef.current?.parentElement?.querySelectorAll<HTMLElement>("button, video[controls]");
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [close, go]);

  // lock the page behind
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      origin?.focus({ preventScroll: true });
    };
  }, [origin]);

  // swipe sideways between clips on touch screens
  const touch = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      data-gf-keep-open
      role="dialog"
      aria-modal="true"
      aria-label={`${file.name}, ${t.from} ${folder}`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
    >
      <div
        ref={backdropRef}
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        style={{ opacity: 0 }}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-[min(960px,calc((100dvh-12rem)*16/9))] overflow-hidden rounded-[22px] border border-white/10 bg-neutral-900/80 text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] will-change-transform"
        style={{ opacity: 0 }}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start) return;
          const dx = e.changedTouches[0].clientX - start.x;
          const dy = e.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
          else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
        }}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={index}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d * 60, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d * -60, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute inset-0"
            >
              <Media file={file} />
            </motion.div>
          </AnimatePresence>

          {many ? (
            <>
              <NavButton side="left" onClick={() => go(-1)} />
              <NavButton side="right" onClick={() => go(1)} />
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">{folder}</p>
            <h3 className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-xl">{file.name}</h3>
            {file.meta ? <p className="mt-0.5 font-mono text-xs text-neutral-400">{file.meta}</p> : null}
          </div>
          {many ? (
            <div className="flex gap-1.5" aria-label={`${t.clip} ${index + 1} ${t.of} ${files.length}`}>
              {files.map((f, i) => (
                <button
                  key={f.name}
                  type="button"
                  aria-label={`${t.show} ${f.name}`}
                  aria-current={i === index || undefined}
                  onClick={() => {
                    setDir(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={
                    "h-1.5 rounded-full transition-all duration-300 " +
                    (i === index ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60")
                  }
                />
              ))}
            </div>
          ) : null}
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label={t.close}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Media({ file }: { file: FolderFile }) {
  if (file.video) {
    return (
      <video
        key={file.video}
        src={file.video}
        poster={file.image}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="auto"
      />
    );
  }
  if (file.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={file.image} alt={file.name} className="h-full w-full object-cover" draggable={false} />;
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-neutral-800 to-neutral-900 text-center">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">Clip in the edit</span>
      <span className="text-sm text-neutral-300">Footage coming soon</span>
    </div>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const t = useT(texts);
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? t.prev : t.next}
      className={
        "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 sm:grid " +
        (side === "left" ? "left-3" : "right-3")
      }
    >
      <Icon className="size-5" />
    </button>
  );
}
