"use client";

import { ArrowUpRight } from "lucide-react";
import {
  Arrow,
  Doodle,
  Heading,
  Marked,
  PenMark,
  Sheet,
  Write,
} from "@/components/front/notebook";
import { GenieLink } from "@/lib/smooth-scroll";
import { useT } from "@/lib/lang";

const EMAIL = "peterfrolov09@gmail.com";

const texts = {
  da: {
    title: "Ydelser",
    // *…* gets a pen underline, […] a pen oval
    lead: "Jeg laver FPV-dronevideoer til virksomheder, der gerne vil ses. Her kan du se, hvad jeg tilbyder, og *hvordan det foregår*, fra den første snak til [den færdige video].",
    clipNote: "sådan ser en one-take ud",
    clipAlt: "FPV-drone flyver i ét skud hen over et landskab",
    services: [
      {
        name: "Video til sociale medier",
        text: "Korte klip med fart og bevægelse til Reels, TikTok og annoncer, lavet til at få folk til at stoppe op i feedet.",
      },
      {
        name: "One-takes",
        text: "Én lang, uklippet flyvning gennem jeres butik, restaurant, hotel eller værksted: ind ad døren og hele vejen igennem.",
      },
      {
        name: "House tours",
        text: "Boligvideo til ejendomsmæglere og udlejere. Køberne ser hele boligen i ét skud og forstår, hvordan rummene hænger sammen.",
      },
    ],
    processTitle: "Sådan foregår det",
    processLead:
      "Fire trin, og I behøver ikke at vide noget om droner. Jeg sørger for flyvningen, klipningen og reglerne, og I får en video, der er klar til brug.",
    steps: [
      {
        title: "Vi snakker sammen",
        note: "ingen overraskelser",
        text: "Vi tager en snak over telefonen, på mail eller ude hos jer. I fortæller, hvad videoen skal bruges til, og hvad den skal vise. Så lægger jeg en plan for ruten: hvor dronen starter, hvilke rum eller steder den flyver igennem, og hvor den slutter.",
        points: [
          "Hvad videoen skal bruges til: Instagram, boligannonce eller hjemmeside",
          "Hvor og hvornår vi optager",
          "Ruten gennem stedet",
          "En fast pris, før vi går i gang",
        ],
      },
      {
        title: "Jeg flyver",
        note: "tæt på, men sikkert",
        text: "På optagedagen kommer jeg ud til jer. Indendørs flyver jeg med en cinewhoop: en lille, let drone med værn om propellerne, så den kan komme tæt forbi møbler, døre og mennesker. Jeg flyver ruten flere gange, så vi er sikre på at have det bedste skud.",
        points: [
          "I må gerne gøre klar: tænd lyset, ryd op og åbn dørene",
          "Jeg flyver ruten igen og igen, til den sidder",
          "Jeg flyver kun dér, hvor reglerne tillader det",
        ],
      },
      {
        title: "Jeg klipper",
        note: "her bliver det til film",
        text: "Hjemme ved computeren stabiliserer jeg optagelserne i Gyroflow og klipper, farvekorrigerer og lægger musik på i DaVinci Resolve. I får et udkast at se og kan sige til, hvis noget skal ændres.",
        points: [
          "Stående format til Reels og TikTok",
          "Liggende format til hjemmeside og YouTube",
          "Farver, musik og jeres logo, hvis I vil",
          "Et udkast, I kan kommentere på",
        ],
      },
      {
        title: "Du får videoen",
        note: "klar til at lægge op",
        text: "I får de færdige filer i fuld kvalitet via et downloadlink, klar til at lægge op med det samme. Videoen er jeres at bruge på jeres egne kanaler: hjemmesiden, de sociale medier og i annoncer.",
        points: [
          "Færdige filer i fuld kvalitet",
          "I de formater, I skal bruge",
          "Fri brug på jeres egne kanaler",
        ],
      },
    ],
    faqTitle: "Godt at vide",
    faq: [
      {
        q: "Indendørs eller udendørs?",
        a: "Indendørs er cinewhoopen mit hovedværktøj. Udendørs er reglerne for droner strengere, især i byer og tæt på huse og mennesker. Derfor tjekker jeg altid stedet før optagelsen og siger det ærligt, hvis et skud ikke kan laves lovligt.",
      },
      {
        q: "Hvad koster det?",
        a: "Det afhænger af stedet, ruten og hvor mange videoer I skal bruge. I får altid en fast pris, før vi går i gang.",
      },
      {
        q: "Hvad hvis vejret er dårligt?",
        a: "Udendørs kræver det tørvejr og ikke for meget vind. Er vejret dårligt, finder vi en ny dag. Indendørs er vejret ligegyldigt.",
      },
      {
        q: "Må du vise videoen?",
        a: "Kun hvis I siger ja. Jeg spørger altid først, om jeg må vise videoen blandt mit arbejde.",
      },
    ],
    ctaTitle: "Skal vi lave en video sammen?",
    ctaLead:
      "Skriv et par linjer om jeres virksomhed, og hvad I gerne vil vise, så vender jeg tilbage med en idé og en pris.",
    cta: "Få et tilbud",
    work: "Se mit arbejde",
    orMail: "eller skriv direkte til",
  },
  en: {
    title: "Services",
    lead: "I make FPV drone videos for businesses that want to be seen. Here you can see what I offer and *how it works*, from the first chat to [the finished video].",
    clipNote: "this is what a one-take looks like",
    clipAlt: "An FPV drone flying across a landscape in one shot",
    services: [
      {
        name: "Social media videos",
        text: "Short clips full of speed and motion for Reels, TikTok and ads, made to make people stop scrolling.",
      },
      {
        name: "One-takes",
        text: "One long, uncut flight through your shop, restaurant, hotel or workshop: in through the door and all the way through.",
      },
      {
        name: "House tours",
        text: "Property videos for estate agents and landlords. Buyers see the whole home in one shot and understand how the rooms fit together.",
      },
    ],
    processTitle: "How it works",
    processLead:
      "Four steps, and you don't need to know anything about drones. I take care of the flying, the editing and the rules, and you get a video that's ready to use.",
    steps: [
      {
        title: "We talk",
        note: "no surprises",
        text: "We have a chat on the phone, by email or at your place. You tell me what the video is for and what it should show. Then I plan the route: where the drone starts, which rooms or places it flies through, and where it ends.",
        points: [
          "What the video is for: Instagram, a property listing or your website",
          "Where and when we film",
          "The route through the place",
          "A fixed price before we start",
        ],
      },
      {
        title: "I fly",
        note: "close, but safe",
        text: "On the day, I come out to you. Indoors I fly a cinewhoop: a small, light drone with guards around the propellers, so it can get close to furniture, doors and people. I fly the route several times, so we're sure to have the best shot.",
        points: [
          "Feel free to get ready: lights on, tidy up and open the doors",
          "I fly the route again and again until it's right",
          "I only fly where the rules allow it",
        ],
      },
      {
        title: "I edit",
        note: "this is where it becomes a film",
        text: "Back at my computer I stabilise the footage in Gyroflow, then cut, colour grade and add music in DaVinci Resolve. You see a draft and can tell me if anything should change.",
        points: [
          "Vertical format for Reels and TikTok",
          "Horizontal format for your website and YouTube",
          "Colours, music and your logo if you like",
          "A draft you can comment on",
        ],
      },
      {
        title: "You get the video",
        note: "ready to post",
        text: "You get the finished files in full quality through a download link, ready to post right away. The video is yours to use on your own channels: your website, social media and ads.",
        points: [
          "Finished files in full quality",
          "In the formats you need",
          "Free use on your own channels",
        ],
      },
    ],
    faqTitle: "Good to know",
    faq: [
      {
        q: "Indoors or outdoors?",
        a: "Indoors, the cinewhoop is my main tool. Outdoors, the drone rules are stricter, especially in towns and close to houses and people. So I always check the location before filming and tell you honestly if a shot can't be done legally.",
      },
      {
        q: "What does it cost?",
        a: "It depends on the place, the route and how many videos you need. You always get a fixed price before we start.",
      },
      {
        q: "What if the weather is bad?",
        a: "Outdoors needs dry weather and not too much wind. If the weather is bad, we find a new day. Indoors, the weather doesn't matter.",
      },
      {
        q: "Can you show the video?",
        a: "Only if you say yes. I always ask first whether I may show the video among my work.",
      },
    ],
    ctaTitle: "Shall we make a video together?",
    ctaLead:
      "Write a few lines about your business and what you'd like to show, and I'll get back to you with an idea and a price.",
    cta: "Get a quote",
    work: "See my work",
    orMail: "or write directly to",
  },
};

/* The services page (/ydelser): what Peter offers, then the four steps of making a video for
   a customer (the same four as the "Sådan foregår det" stack on the front page, written out),
   a few things worth knowing (incl. that outdoor flying depends on the drone rules), and a
   contact call. Built from the front page's notebook pieces (paper sheets, blue pen). */
export function Ydelser() {
  const t = useT(texts);
  return (
    <>
      <Sheet className="yd-first">
        <div className="yd-wrap">
          <div className="yd-top">
            <div>
              <Heading text={t.title} seed={31} as="h2" />
              <p className="mg-p yd-lead" data-ink>
                <Marked text={t.lead} seed={310} />
              </p>
            </div>
            <figure className="yd-clip" data-ink>
              <div className="yd-clip-frame">
                <div className="yd-clip-media">
                  <video
                    src="/clips/pande-ram-720.mp4"
                    poster="/clips/pande-ram.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={t.clipAlt}
                  />
                </div>
                <PenMark kind="box" seed={33} padX={10} padY={10} />
              </div>
              <figcaption className="yd-clip-note mg-hand">
                <svg viewBox="0 0 60 50" className="mg-ink" aria-hidden="true">
                  <Arrow
                    a={[8, 44]}
                    b={[46, 8]}
                    bend={0.3}
                    head={8}
                    delay={0.8}
                  />
                </svg>
                <Write delay={1.1}>{t.clipNote}</Write>
              </figcaption>
            </figure>
          </div>

          <ul className="yd-services" data-ink>
            {t.services.map((s, i) => (
              <li key={s.name} className="yd-service">
                <span className="mg-compare-n mg-hand">{i + 1}</span>
                <h3 className="mg-compare-name">{s.name}</h3>
                <p className="mg-compare-text">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Sheet>

      <Sheet id="processen">
        <div className="yd-wrap">
          <Heading text={t.processTitle} seed={34} />
          <p className="mg-p yd-lead" data-ink>
            {t.processLead}
          </p>

          <ol className="yd-steps">
            {t.steps.map((s, i) => (
              <li key={s.title} className="yd-step" data-ink>
                <div className="yd-step-head">
                  <span className="yd-step-n mg-hand">
                    <span className="mg-mk">
                      {i + 1}
                      <PenMark
                        kind="oval"
                        seed={40 + i}
                        padX={14}
                        padY={6}
                        delay={0.2}
                      />
                    </span>
                  </span>
                  <h3 className="mg-display yd-step-title">{s.title}</h3>
                  <div className="yd-step-note mg-hand" aria-hidden="true">
                    <Write delay={0.7}>{s.note}</Write>
                  </div>
                </div>
                <div className="yd-step-body">
                  <p className="mg-p">{s.text}</p>
                  <ul className="mg-skill-list yd-points">
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Sheet>

      <Sheet tone="night" grow>
        <div className="yd-wrap">
          <Heading text={t.faqTitle} seed={36} />
          <dl className="yd-faq" data-ink>
            {t.faq.map((f) => (
              <div key={f.q} className="yd-faq-item">
                <dt className="mg-compare-name">{f.q}</dt>
                <dd className="mg-compare-text">{f.a}</dd>
              </div>
            ))}
          </dl>

          <div className="yd-cta" data-ink>
            <div className="yd-cta-copy">
              <h2 className="mg-display yd-cta-title">{t.ctaTitle}</h2>
              <p className="mg-p mg-muted yd-cta-lead">{t.ctaLead}</p>
            </div>
            <div>
              <div className="mg-hello-cta yd-cta-btns">
                <GenieLink
                  href="/kontakt"
                  className="group mg-btn yd-btn-light"
                >
                  {t.cta}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </GenieLink>
                <GenieLink
                  href="/arbejde"
                  className="mg-btn mg-btn-ghost yd-btn-ghost"
                >
                  {t.work}
                </GenieLink>
              </div>
              <p className="yd-mail mg-hand">
                <Doodle kind="pencil" />
                <span>
                  {t.orMail}{" "}
                  <a href={`mailto:${EMAIL}`} className="yd-mail-link">
                    {EMAIL}
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
