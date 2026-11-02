import { Hero } from "@/components/hero";
import { GalleryWall } from "@/components/gallery-wall";
import { Statement } from "@/components/landing/statement";
import { VideoReveal } from "@/components/landing/video-reveal";
import { Marquee } from "@/components/landing/marquee";
import { ClipStrip } from "@/components/landing/clip-strip";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <main>
      <Hero />
      {/* the rest of the page slides up over the intro video like a curtain */}
      <div className="relative z-10 bg-background md:rounded-t-[3rem] md:shadow-[0_-30px_60px_-30px_rgba(13,28,9,0.5)]">
        <GalleryWall />
        <Statement />
        <VideoReveal />
        <Marquee />
        <ClipStrip />
        <Contact />
      </div>
    </main>
  );
}
