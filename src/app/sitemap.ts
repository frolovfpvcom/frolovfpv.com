import type { MetadataRoute } from "next";
import { IMAGES, PANORAM_FRAME, SITE_URL, VIDEOS, abs } from "@/lib/seo";

/** frolovfpv.com/sitemap.xml: every page, with the pictures and clips on it, so Google finds them all. */
export default function sitemap(): MetadataRoute.Sitemap {
  const clips = [VIDEOS.intro, VIDEOS.panoram, VIDEOS.testkoersel];
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
      images: [...clips.map((v) => abs(v.poster)), abs(PANORAM_FRAME)],
      videos: clips.map((v) => ({
        title: v.name,
        description: v.description,
        thumbnail_loc: abs(v.poster),
        content_loc: abs(v.src),
        duration: v.seconds,
        publication_date: v.uploadDate,
        family_friendly: "yes" as const,
        uploader: { info: `${SITE_URL}/ommig`, content: "Peter Frolov" },
      })),
    },
    { url: `${SITE_URL}/arbejde`, changeFrequency: "monthly", priority: 0.8, images: [abs(VIDEOS.panoram.poster)] },
    { url: `${SITE_URL}/ommig`, changeFrequency: "monthly", priority: 0.8, images: [abs(IMAGES.portrait.src)] },
    { url: `${SITE_URL}/kontakt`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
