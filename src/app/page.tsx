import { Hero } from "@/components/hero";
import { Clients } from "@/components/sections/clients";
import { Showreel } from "@/components/sections/showreel";
import { FeaturedWork } from "@/components/sections/featured-work";
import { ServicesTeaser } from "@/components/sections/services-teaser";
import { Process } from "@/components/sections/process";
import { AboutTeaser } from "@/components/sections/about";
import { CtaBand } from "@/components/sections/cta-band";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Clients />
      <Showreel />
      <FeaturedWork />
      <ServicesTeaser />
      <Process />
      <AboutTeaser />
      <CtaBand />
    </main>
  );
}
