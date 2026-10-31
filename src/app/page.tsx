import { Hero } from "@/components/hero";
import { GalleryWall } from "@/components/gallery-wall";
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
        <GalleryWall />
        <Services />
        <About />
        <Timeline />
        <Contact />
        <Work />
      </main>
    </>
  );
}
