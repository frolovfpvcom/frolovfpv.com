"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/sections/project-card";
import { projects } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: { eyebrow: "Udvalgt arbejde", title: "Seneste flyvninger", all: "Se alt arbejde" },
  en: { eyebrow: "Selected work", title: "Latest flights", all: "See all work" },
};

export function FeaturedWork() {
  const t = useT(texts);
  return (
    <section className="border-t border-line px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="display mt-5 text-5xl md:text-7xl">{t.title}</h2>
          </div>
          <ButtonLink href="/arbejde" variant="secondary" className="self-start md:self-auto">
            {t.all}
          </ButtonLink>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
          {projects.slice(0, 3).map((project, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <ProjectCard project={project} index={i} tall />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
