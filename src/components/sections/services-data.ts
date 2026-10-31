import type { Lang } from "@/lib/lang";

export type Service = { title: string; short: string; long: string; points: string[] };

/** The four services, used on the front page (short) and on /ydelser (long). */
export const services: Record<Lang, Service[]> = {
  da: [
    {
      title: "Reklame & brands",
      short: "Energiske reklamefilm og indhold til sociale medier, der får folk til at stoppe op.",
      long: "En FPV-drone kan flyve helt tæt på produktet, gennem rummet og ud over landskabet i én lang bevægelse. Det giver reklamefilm, der føles som en rutsjebanetur, og som skiller sig ud i feedet.",
      points: ["Bil- og produktfilm", "Indhold til sociale medier", "Brandfilm og kampagner"],
    },
    {
      title: "Events & koncerter",
      short: "Unikke vinkler fra festivaler, koncerter, sport og liveevents.",
      long: "Jeg flyver hen over scenen, gennem publikum og rundt om handlingen, så din aftermovie viser stemningen, som den faktisk føltes.",
      points: ["Aftermovies", "Festivaler og koncerter", "Sport og motorsport"],
    },
    {
      title: "Ejendomme",
      short: "Dynamiske gennemflyvninger af boliger, erhverv og byggeprojekter, inde og ude.",
      long: "Én uklippet flyvning fra indkørslen, ind ad hoveddøren og gennem hele huset giver købere en fornemmelse af stedet, som billeder ikke kan.",
      points: ["Boliger og sommerhuse", "Erhvervsejendomme", "Byggeprojekter"],
    },
    {
      title: "Natur & eventyr",
      short: "Episke luftperspektiver af landskaber, kyst, skov og ekspeditioner.",
      long: "Fra klitter og klinter til skov og fjeld. Jeg finder de linjer i landskabet, der gør en naturfilm filmisk.",
      points: ["Turisme og destinationer", "Musikvideoer", "Dokumentar"],
    },
  ],
  en: [
    {
      title: "Commercials & brands",
      short: "High-energy commercials and social content that make people stop scrolling.",
      long: "An FPV drone can fly right up to the product, through the room and out over the landscape in one long move. That makes commercials that feel like a rollercoaster ride and stand out in the feed.",
      points: ["Car and product films", "Social media content", "Brand films and campaigns"],
    },
    {
      title: "Events & concerts",
      short: "Unique angles from festivals, concerts, sport and live events.",
      long: "I fly over the stage, through the crowd and around the action, so your aftermovie shows the atmosphere the way it actually felt.",
      points: ["Aftermovies", "Festivals and concerts", "Sport and motorsport"],
    },
    {
      title: "Real estate",
      short: "Dynamic fly-throughs of homes, commercial property and builds, inside and out.",
      long: "One unbroken flight from the driveway, in through the front door and through the whole house gives buyers a feel for the place that photos can't.",
      points: ["Homes and holiday houses", "Commercial property", "Construction projects"],
    },
    {
      title: "Nature & adventure",
      short: "Epic aerial perspectives of landscapes, coast, forest and expeditions.",
      long: "From dunes and cliffs to forest and mountains. I find the lines in the landscape that make a nature film cinematic.",
      points: ["Tourism and destinations", "Music videos", "Documentary"],
    },
  ],
};
