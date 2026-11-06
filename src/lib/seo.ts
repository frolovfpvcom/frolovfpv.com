/**
 * Everything search engines read about the site in one place: the address,
 * the media files (named with the words people search for) and the texts that
 * describe them. The pages, the sitemap and the structured data all use it.
 */

export const SITE_URL = "https://frolovfpv.com";
export const SITE_NAME = "Frolov FPV";
export const INSTAGRAM_URL = "https://www.instagram.com/frolovfpv/";
export const EMAIL = "peterfrolov09@gmail.com";

export const KEYWORDS = [
  "FPV",
  "FPV-drone",
  "FPV drone",
  "FPV-dronefilm",
  "dronefilm",
  "droneoptagelser",
  "dronevideo",
  "dronefotograf",
  "dronepilot",
  "FPV-pilot",
  "one shot",
  "gennemflyvning",
  "drone ejendomme",
  "drone Danmark",
  "Frolov",
  "Frolov FPV",
  "Peter Frolov",
];

/** Images, with alt texts that say what is in them. */
export const IMAGES = {
  logo: {
    src: "/billeder/frolov-fpv-logo.png",
    alt: "Frolov FPV logo",
  },
  portrait: {
    src: "/billeder/peter-frolov-fpv-dronepilot.jpg",
    alt: "Peter Frolov, FPV-dronepilot, med FPV-briller på",
    width: 1200,
    height: 1600,
  },
  share: {
    src: "/billeder/frolov-fpv-fpv-drone-dronefilm-deling.jpg",
    alt: "Frolov FPV – FPV-dronefilm helt tæt på",
    width: 1200,
    height: 630,
  },
} as const;

export type SeoVideo = {
  /** Full-size file. */
  src: string;
  /** Lighter 720p file for phones, when there is one. */
  mobile?: string;
  /** First frame, shown while the clip loads. */
  poster: string;
  name: string;
  description: string;
  /** ISO 8601 duration, e.g. PT13S. */
  duration: string;
  seconds: number;
  /** When the clip was put on the site. */
  uploadDate: string;
};

export const VIDEOS = {
  intro: {
    src: "/video/fpv-drone-dronefilm-frolov-fpv-intro.mp4",
    mobile: "/video/fpv-drone-dronefilm-frolov-fpv-intro-720p.mp4",
    poster: "/billeder/fpv-drone-dronefilm-frolov-fpv-intro.jpg",
    name: "Frolov FPV – intro med FPV-drone",
    description:
      "Introfilm fra Frolov FPV: FPV-dronefilm fløjet og filmet af Peter Frolov, helt tæt på og fra vinkler almindelige droner ikke kan nå.",
    duration: "PT14S",
    seconds: 14,
    uploadDate: "2026-10-31T20:04:00+01:00",
  },
  panoram: {
    src: "/video/fpv-dronefilm-panoram-dansk-natur.mp4",
    mobile: "/video/fpv-dronefilm-panoram-dansk-natur-720p.mp4",
    poster: "/billeder/fpv-dronefilm-panoram-dansk-natur.jpg",
    name: "Panoram – FPV-dronefilm i dansk natur",
    description:
      "Svæver igennem den lokale danske natur, der er nogle små guldklumper gemt rundt i byen. FPV-dronefilm i 4K af Peter Frolov.",
    duration: "PT13S",
    seconds: 13,
    uploadDate: "2026-11-02T17:34:07+01:00",
  },
  testkoersel: {
    src: "/video/fpv-drone-bilvideo-testkoersel.mp4",
    poster: "/billeder/fpv-drone-bilvideo-testkoersel.jpg",
    name: "Testkørsel – bilvideo med FPV-drone",
    description: "Test af bil på privat område, filmet tæt på med FPV-drone af Peter Frolov.",
    duration: "PT10S",
    seconds: 10,
    uploadDate: "2026-11-03T07:17:13+01:00",
  },
} satisfies Record<string, SeoVideo>;

/** Frame picture for Panoram on the gallery wall (cropped differently from the poster). */
export const PANORAM_FRAME = "/billeder/fpv-dronefilm-panoram-dansk-natur-ramme.jpg";

export const HOME_TITLE = "Frolov FPV – FPV-drone og dronefilm i Danmark";
export const HOME_DESCRIPTION =
  "Frolov FPV laver FPV-dronefilm i Danmark: filmiske FPV-droneoptagelser og one shots helt tæt på, til ejendomme, virksomheder, events og natur. Fløjet af Peter Frolov.";

export const abs = (path: string) => new URL(path, SITE_URL).toString();

/** Serialises structured data for a <script type="application/ld+json">, safe from </script> injection. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

const ORG_ID = `${SITE_URL}/#organisation`;
const PERSON_ID = `${SITE_URL}/#peter-frolov`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Who is behind the site: the business, Peter and the website itself. */
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": ORG_ID,
      name: SITE_NAME,
      alternateName: ["FrolovFPV", "Frolov FPV dronefilm"],
      url: SITE_URL,
      logo: abs(IMAGES.logo.src),
      image: abs(IMAGES.share.src),
      description:
        "FPV-dronefilm i Danmark: filmiske FPV-droneoptagelser og one shots helt tæt på, til ejendomme, virksomheder, events, reklame og natur.",
      email: EMAIL,
      areaServed: { "@type": "Country", name: "Danmark" },
      founder: { "@id": PERSON_ID },
      sameAs: [INSTAGRAM_URL],
      knowsAbout: ["FPV", "FPV-drone", "Dronefilm", "One shot-video", "Gennemflyvning af ejendomme"],
      makesOffer: [
        "FPV-dronefilm og reels",
        "One shot-gennemflyvning af ejendomme",
        "FPV-droneoptagelser til events",
        "Dronefilm af natur og rejser",
      ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Peter Frolov",
      jobTitle: "FPV-dronepilot",
      image: abs(IMAGES.portrait.src),
      url: `${SITE_URL}/ommig`,
      worksFor: { "@id": ORG_ID },
      sameAs: [INSTAGRAM_URL],
      knowsAbout: ["FPV-droner", "Dronefilm", "Fjernstyrede fly"],
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "da-DK",
      publisher: { "@id": ORG_ID },
    },
  ],
};

export const videoObject = (v: SeoVideo, pagePath = "/") => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: v.name,
  description: v.description,
  thumbnailUrl: [abs(v.poster)],
  contentUrl: abs(v.src),
  uploadDate: v.uploadDate,
  duration: v.duration,
  inLanguage: "da-DK",
  url: abs(pagePath),
  creator: { "@id": PERSON_ID },
  publisher: { "@id": ORG_ID },
});

/**
 * Title, description, canonical address and share card for one page.
 * Next.js replaces openGraph/twitter as a whole per page, so the full card is built here.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  /** Use the title as it is, without " | Frolov FPV" after it (the front page). */
  absoluteTitle?: boolean;
}) {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const image = { url: IMAGES.share.src, width: IMAGES.share.width, height: IMAGES.share.height, alt: IMAGES.share.alt };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      locale: "da_DK",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image" as const, title: fullTitle, description, images: [IMAGES.share.src] },
  };
}
