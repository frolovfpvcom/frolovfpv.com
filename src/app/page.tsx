import { Hero } from "@/components/hero";
import { Hello } from "@/components/front/hello";
import { WhyFpv } from "@/components/front/why-fpv";
import { Skills } from "@/components/front/skills";
import { ProjectReel } from "@/components/front/project-reel";

/* The front page: the intro video, then a notebook laid out like a CV (Peter picked the style
   from a CV template): "Hej." with his photo and a few lines about him (the "Ydelser" link
   lands there), Hvorfor FPV? (why FPV beats photos, handheld video and a regular drone),
   Kompetencer, and Projekter, where the page holds still while his
   videos play. The footer with Instagram, LinkedIn and Cookies follows from the layout. */
export default function Home() {
  return (
    <main>
      <Hero />
      <Hello />
      <WhyFpv />
      <Skills />
      <ProjectReel />
    </main>
  );
}
