import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { Services } from "@/components/services";
import { About } from "@/components/about";
import { Timeline } from "@/components/timeline";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Work />
        <Services />
        <About />
        <Timeline />
        <Contact />
      </main>
    </>
  );
}
