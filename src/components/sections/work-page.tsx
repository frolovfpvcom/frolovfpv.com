"use client";

import { PageHeader } from "@/components/sections/page-header";
import { ProjectCard } from "@/components/sections/project-card";
import { Reveal } from "@/components/ui/reveal";
import { projects } from "@/lib/media";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    eyebrow: "Arbejde",
    title: "Udvalgt arbejde",
    lead: "Et udvalg af flyvninger til reklamer, events og natur. Der er stadig plads på væggen, så dit projekt kunne være det næste.",
  },
  en: {
    eyebrow: "Work",
    title: "Selected work",
    lead: "A selection of flights for commercials, events and nature. There's still room on the wall, so your project could be next.",
  },
};

export function WorkPage() {
  const t = useT(texts);
  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
      <section className="px-5 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={i} delay={(i % 2) * 0.08}>
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
