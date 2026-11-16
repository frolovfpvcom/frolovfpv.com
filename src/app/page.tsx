import { Hero } from "@/components/hero";
import { Projects } from "@/components/front/projects";
import { AboutTeaser } from "@/components/front/about-teaser";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
      <AboutTeaser />
      <Contact />
    </main>
  );
}
