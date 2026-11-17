"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ClipViewer, type ClipSelection } from "@/components/clip-viewer";
import { Phone, phones } from "@/components/front/phones";
import { Reveal } from "@/components/ui/reveal";
import { GenieLink } from "@/lib/smooth-scroll";
import { useLang, useT, type Lang } from "@/lib/lang";

/* What Peter sells to businesses: three services, each shown as a phone that keeps playing an
   example (a click opens it big), with who it's for and a button that opens the contact form
   with it chosen. */

type Service = {
  /** Used in /kontakt?ydelse=… so the form opens with this service picked. */
  slug: string;
  image: string;
  video: string;
  videoMobile?: string;
  aspect: number;
};

const media: Service[] = [
  { slug: "sociale-medier", image: "/projekter/testkorsel.jpg", video: "/clips/testkorsel.mp4", aspect: 4 / 3 },
  {
    slug: "one-take",
    image: "/projekter/pande-ram.jpg",
    video: "/clips/pande-ram.mp4",
    videoMobile: "/clips/pande-ram-720.mp4",
    aspect: 16 / 9,
  },
  {
    slug: "house-tour",
    image: "/projekter/house-tour.jpg",
    video: "/clips/house-tour.mp4",
    videoMobile: "/clips/house-tour-720.mp4",
    aspect: 4 / 3,
  },
];

/* Each service has its own deep colour on the dark band (blue, green, plum), with a lighter
   tint of the same colour for small labels. */
const tones = [
  { bg: "#263b73", tint: "#a9bcff" },
  { bg: "#1d554a", tint: "#8fe0c6" },
  { bg: "#562b55", tint: "#f0b3e4" },
];

const texts: Record<
  Lang,
  {
    label: string;
    title: string;
    lead: string;
    forWho: string;
    price: string;
    example: string;
    folder: string;
    items: { kicker: string; title: string; text: string; who: string }[];
  }
> = {
  da: {
    label: "Ydelser",
    title: "Det kan jeg gøre for jeres virksomhed",
    lead: "Med en FPV-drone kan kameraet flyve tæt på, ind gennem døre og hele vejen rundt. Det giver billeder, folk ikke har set før, og som får dem til at stoppe op.",
    forWho: "Til",
    price: "Spørg om pris",
    example: "Se eksempel",
    folder: "Ydelser",
    items: [
      {
        kicker: "Bliv set",
        title: "Indhold til sociale medier",
        text: "Korte klip, der stopper scrollet på Instagram, TikTok og Facebook. Jeg filmer jeres forretning, produkter eller event fra vinkler, ingen andre har, og leverer klippene klar til at poste.",
        who: "Butikker, restauranter, bilforhandlere, events og brands",
      },
      {
        kicker: "Ét skud, ingen klip",
        title: "One-takes",
        text: "Dronen flyver igennem hele stedet i én sammenhængende tur: ind ad døren, gennem lokalerne og ud igen. Seeren får hele oplevelsen på én gang, og det er svært at kigge væk.",
        who: "Showrooms, hoteller, restauranter, fitnesscentre, fabrikker og events",
      },
      {
        kicker: "Til ejendomsmæglere",
        title: "House tours",
        text: "En flydende tur gennem boligen, inde og ude, så købere får fornemmelsen af selv at gå rundt. Det får boligen til at skille sig ud i annoncen og på sociale medier.",
        who: "Ejendomsmæglere, ejendomsvirksomheder, udlejere og boligudviklere",
      },
    ],
  },
  en: {
    label: "Services",
    title: "What I can do for your business",
    lead: "With an FPV drone the camera can fly up close, in through doors and all the way around. That gives shots people haven't seen before, and that make them stop.",
    forWho: "For",
    price: "Ask for a price",
    example: "See example",
    folder: "Services",
    items: [
      {
        kicker: "Get seen",
        title: "Social media content",
        text: "Short clips that stop the scroll on Instagram, TikTok and Facebook. I film your business, products or event from angles nobody else has, and deliver the clips ready to post.",
        who: "Shops, restaurants, car dealers, events and brands",
      },
      {
        kicker: "One shot, no cuts",
        title: "One-takes",
        text: "The drone flies through the whole place in one continuous run: in through the door, through the rooms and back out. Viewers get the whole experience at once, and it's hard to look away.",
        who: "Showrooms, hotels, restaurants, gyms, factories and events",
      },
      {
        kicker: "For real estate agents",
        title: "House tours",
        text: "A smooth tour through the home, inside and out, so buyers get the feeling of walking around themselves. It makes the property stand out in the listing and on social media.",
        who: "Real estate agents, property companies, landlords and developers",
      },
    ],
  },
};

function ServiceCard({
  service,
  index,
  play,
  onOpen,
}: {
  service: Service;
  index: number;
  play: boolean;
  onOpen: (el: HTMLElement) => void;
}) {
  const t = useT(texts);
  const item = t.items[index];
  const tone = tones[index];

  return (
    <Reveal delay={index * 0.08} className="h-full">
      <article className="flex h-full flex-col">
        {/* the phone plays its clip all the time; a click opens the clip big */}
        <button
          type="button"
          onClick={(e) => onOpen(e.currentTarget)}
          aria-label={`${t.example}: ${item.title}`}
          className="relative mx-auto block w-[min(62vw,250px)] transition-transform duration-500 hover:-translate-y-1.5 lg:w-[min(17vw,250px)]"
        >
          {/* a soft glow in the service's own colour behind the phone */}
          <span
            aria-hidden="true"
            className="absolute inset-[-18%] -z-0 rounded-full opacity-70 blur-3xl"
            style={{ background: `radial-gradient(closest-side, ${tone.bg}, transparent)` }}
          />
          <span className="relative block text-left">
            <Phone phone={phones[index]} label={item.title} play={play} />
          </span>
        </button>

        <div className="mt-9 flex flex-1 flex-col text-center lg:mt-10">
          <p className="text-[12px] uppercase tracking-[0.16em]" style={{ color: tone.tint }}>
            0{index + 1} · {item.kicker}
          </p>
          <h3 className="mt-2.5 font-serif text-[34px] leading-[1.05] md:text-[38px]">{item.title}</h3>
          <p className="mx-auto mt-3 max-w-[38ch] text-[15px] leading-relaxed text-white/70">{item.text}</p>
          <p className="mx-auto mt-3 max-w-[38ch] text-[13px] text-white/50">
            {t.forWho}: {item.who}
          </p>

          {/* pushed to the bottom, so the three buttons line up side by side */}
          <div className="mt-auto flex justify-center pt-6">
            <GenieLink
              href={`/kontakt?ydelse=${service.slug}`}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium transition-opacity hover:opacity-85"
              style={{ color: tone.bg }}
            >
              {t.price}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </GenieLink>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function Services() {
  const t = useT(texts);
  const { lang } = useLang();
  const [clip, setClip] = useState<ClipSelection | null>(null);
  const [near, setNear] = useState(false);
  const section = useRef<HTMLElement>(null);
  const files = media.map((m, i) => ({
    name: texts[lang].items[i].title,
    video: m.video,
    videoMobile: m.videoMobile,
    aspect: m.aspect,
    image: m.image,
  }));

  // the phones play the whole time the section is on (or near) the screen
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // a darker band, so the services stand out from the white around them
    <section ref={section} id="ydelser" className="overflow-hidden bg-[#16181d] px-5 py-24 text-white md:px-10 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-14 flex flex-col gap-6 md:mb-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[13px] uppercase tracking-[0.14em] text-white/55">{t.label}</p>
            <h2 className="mt-4 max-w-[18ch] font-serif text-[44px] leading-[1.02] md:text-[72px]">{t.title}</h2>
          </div>
          <p className="max-w-[46ch] text-[17px] leading-relaxed text-white/70">{t.lead}</p>
        </div>
        {/* three phones side by side on a computer, one under the other on a phone */}
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-3 lg:gap-10">
          {media.map((service, i) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={i}
              play={near}
              onOpen={(el) => setClip({ files, index: i, folder: t.folder, origin: el })}
            />
          ))}
        </div>
      </div>
      <ClipViewer selection={clip} onClose={() => setClip(null)} />
    </section>
  );
}
