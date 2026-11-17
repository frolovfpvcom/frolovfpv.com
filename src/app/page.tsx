import { Hero } from "@/components/hero";
import { WordSlam } from "@/components/front/word-slam";
import { Pitch } from "@/components/front/pitch";
import { Services } from "@/components/services";
import { Projects } from "@/components/front/projects";
import { Process } from "@/components/front/process";
import { Contact } from "@/components/contact";

/* The front page is a shop window for businesses: the intro video, a line that slams in word by
   word, a pitch for why FPV helps a business, what Peter offers (three phones playing examples),
   more examples, how booking works, and a way to get a quote. */
export default function Home() {
  return (
    <main>
      <Hero />
      <WordSlam />
      <Pitch />
      <Services />
      <Projects />
      <Process />
      <Contact />
    </main>
  );
}
