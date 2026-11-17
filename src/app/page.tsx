import { Hero } from "@/components/hero";
import { Pitch } from "@/components/front/pitch";
import { Services } from "@/components/services";
import { Projects } from "@/components/front/projects";
import { Process } from "@/components/front/process";
import { AboutTeaser } from "@/components/front/about-teaser";
import { Contact } from "@/components/contact";

/* The front page is a shop window for businesses: the intro video, a pitch for why FPV helps a
   business, what Peter offers (three phones playing examples), more examples, how booking works,
   who he is, and a way to get a quote. */
export default function Home() {
  return (
    <main>
      <Hero />
      <Pitch />
      <Services />
      <Projects />
      <Process />
      <AboutTeaser />
      <Contact />
    </main>
  );
}
