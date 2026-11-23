import { Hero } from "@/components/hero";
import { Phones } from "@/components/front/phones";
import { Pitch } from "@/components/front/pitch";
import { Projects } from "@/components/front/projects";
import { Process } from "@/components/front/process";
import { Contact } from "@/components/contact";

/* The front page is a shop window for businesses: the intro video, three phones with clips
   that pop up from below, a pitch for why FPV helps a business (the "Ydelser" link lands there),
   examples, how booking works, and a way to get a quote. Who Peter is lives only on /ommig. */
export default function Home() {
  return (
    <main>
      <Hero />
      <Phones />
      <Pitch />
      <Projects />
      <Process />
      <Contact />
    </main>
  );
}
