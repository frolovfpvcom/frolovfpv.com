import { Hero } from "@/components/hero";
import { FogReveal } from "@/components/front/fog-reveal";
import { Services } from "@/components/services";
import { Projects } from "@/components/front/projects";
import { Process } from "@/components/front/process";
import { AboutTeaser } from "@/components/front/about-teaser";
import { Contact } from "@/components/contact";

/* The front page is a shop window for businesses: the intro video, a clip that comes out of
   the fog, what Peter offers, examples, how booking works, who he is, and a way to get a quote. */
export default function Home() {
  return (
    <main>
      <Hero />
      <FogReveal />
      <Services />
      <Projects />
      <Process />
      <AboutTeaser />
      <Contact />
    </main>
  );
}
