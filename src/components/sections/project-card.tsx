"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaSlot } from "@/components/ui/media-slot";
import type { Project } from "@/lib/media";
import { useLang, useT } from "@/lib/lang";

const texts = {
  da: { empty: "Plads til projekt", yours: "Dit projekt her?" },
  en: { empty: "Space for project", yours: "Your project here?" },
};

/** One project: a looping clip with its name and category, or an empty slot. */
export function ProjectCard({ project, index, tall = false }: { project: Project; index: number; tall?: boolean }) {
  const { lang } = useLang();
  const t = useT(texts);
  const filled = Boolean(project.title);
  const number = String(index + 1).padStart(2, "0");

  const body = (
    <>
      <div className={`relative overflow-hidden rounded-2xl border border-line bg-surface ${tall ? "aspect-[4/5]" : "aspect-video"}`}>
        <MediaSlot
          media={project}
          alt={project.title}
          label={t.empty}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground backdrop-blur-sm">
          {project.tag[lang]}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-subtle">{number}</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">{filled ? project.title : t.yours}</h3>
          {project.meta ? <p className="mt-0.5 font-mono text-xs text-muted">{project.meta}</p> : null}
        </div>
        {!filled ? (
          <ArrowUpRight
            size={20}
            aria-hidden="true"
            className="mt-5 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          />
        ) : null}
      </div>
    </>
  );

  // empty slots invite the visitor to get in touch
  return filled ? (
    <article className="group">{body}</article>
  ) : (
    <Link href="/kontakt" className="group block">
      {body}
    </Link>
  );
}
