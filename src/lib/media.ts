/**
 * Every photo and video on the site, in one place.
 *
 * To fill an empty slot: put the file in `public/media/` and write its path
 * here, e.g. `video: "/media/showreel.mp4"` or `image: "/media/bil.jpg"`.
 * A slot with neither `video` nor `image` shows a neat placeholder instead.
 * For videos, add a still frame as `image` too; it shows while the video loads.
 */

export type Media = {
  video?: string;
  image?: string;
};

export type Project = Media & {
  /** Short name shown on the card. Leave out for an empty slot. */
  title?: string;
  /** Category, in Danish and English. */
  tag: { da: string; en: string };
  /** Optional client name, year or format. */
  meta?: string;
};

/** Full-screen video at the top of the front page. */
export const heroMedia: Media = {
  video: "/intro-2.mp4",
};

/** The big showreel on the front page. Empty until the showreel is cut. */
export const showreel: Media = {};

/** Projects on the front page (first three) and on /arbejde (all). */
export const projects: Project[] = [
  {
    title: "Peugeot",
    tag: { da: "Reklame", en: "Commercial" },
    meta: "4K",
    video: "/clips/peugeot/klip-1.mp4",
    image: "/clips/peugeot/klip-1.jpg",
  },
  {
    title: "Panoram",
    tag: { da: "Natur", en: "Nature" },
    meta: "4K",
    video: "/clips/panoram.mp4",
    image: "/clips/panoram.jpg",
  },
  { tag: { da: "Event", en: "Event" } },
  { tag: { da: "Ejendom", en: "Real estate" } },
  { tag: { da: "Musikvideo", en: "Music video" } },
  { tag: { da: "Sport", en: "Sport" } },
];

/** One picture or clip per service on /ydelser, in the same order as the services. */
export const serviceMedia: Media[] = [{}, {}, {}, {}];

/** Portrait on /om. */
export const portrait: Media = {
  image: "/images/portrait.jpg",
};

/** Behind-the-scenes picture on /om (drone, goggles, on location). */
export const behindTheScenes: Media = {};

/**
 * Client logos under the hero. Use white or light logos on a transparent
 * background (PNG or SVG). Empty strings show a placeholder.
 */
export const clientLogos: { name: string; logo: string }[] = [
  { name: "", logo: "" },
  { name: "", logo: "" },
  { name: "", logo: "" },
  { name: "", logo: "" },
  { name: "", logo: "" },
];
