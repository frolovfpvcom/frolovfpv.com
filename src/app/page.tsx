import { Hero } from "@/components/hero";
import { GalleryWall } from "@/components/gallery-wall";
import { Statement } from "@/components/landing/statement";
import { Marquee } from "@/components/landing/marquee";
import { ClipStrip } from "@/components/landing/clip-strip";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      {/* the rest of the page slides up over the intro video like a curtain */}
      <div className="relative z-10 rounded-t-[2rem] bg-background md:rounded-t-[3rem]">
        <GalleryWall />
        <Statement />
        <Marquee />
        <ClipStrip />
        <Contact />
      </div>
    </main>
  );
}
