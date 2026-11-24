import { Hero } from "@/components/hero";
import { AboutIntro } from "@/components/front/about-intro";
import { Projects } from "@/components/front/projects";
import { Process } from "@/components/front/process";
import { Contact } from "@/components/contact";

/* The front page is a shop window for businesses: the intro video, a photo of Peter with a few
   lines about him and what he makes (the "Ydelser" link lands there), examples, how booking works,
   and a way to get a quote. The full Om mig text lives on /ommig. */
export default function Home() {
  return (
    <main>
      <Hero />
      <AboutIntro />
      <Projects />
      <Process />
      <Contact />
    </main>
  );
}
