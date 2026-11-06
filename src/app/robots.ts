import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** frolovfpv.com/robots.txt: every search engine may read the whole site, and here is the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
