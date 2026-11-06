import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { GalleryWall } from "@/components/gallery-wall";
import { Statement } from "@/components/landing/statement";
import { Marquee } from "@/components/landing/marquee";
import { ClipStrip } from "@/components/landing/clip-strip";
import { Contact } from "@/components/contact";
import { Work } from "@/components/work";
import { HOME_DESCRIPTION, HOME_TITLE, VIDEOS, jsonLd, pageMetadata, videoObject } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

// The clips on the front page, described for Google video search.
const videos = [VIDEOS.intro, VIDEOS.panoram, VIDEOS.testkoersel].map((v) => videoObject(v, "/"));

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(videos) }} />
      <Hero />
      {/* the rest of the page slides up over the intro video like a curtain */}
      <div className="relative z-10 rounded-t-[2rem] bg-background md:rounded-t-[3rem]">
        <GalleryWall />
        <Statement />
        <Marquee />
        <ClipStrip />
        <Contact />
        <Work />
      </div>
    </main>
  );
}
