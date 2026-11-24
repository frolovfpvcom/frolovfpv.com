"use client";

import { Arrow, Heading, Marked, PenMark, Sheet, Write } from "@/components/front/notebook";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    title: "Hvorfor FPV?",
    // *…* gets a pen underline, […] a pen oval
    lead: "På billeder ser man ét rum ad gangen, og det kan være svært at fornemme, hvordan et hus er indeni: hvor store rummene er, og hvordan de ligger i forhold til hinanden. En FPV-drone flyver [hele vejen igennem i ét skud]: ind ad døren, gennem stuen, op ad trappen og ud over taget. Så får man *hele oplevelsen*.",
    compare: [
      {
        name: "Billeder",
        text: "Viser ét rum ad gangen. Man skal selv gætte, hvordan det hele hænger sammen.",
      },
      {
        name: "Håndholdt kamera",
        text: "Kommer rundt indenfor, men går langsomt, ryster og kan ikke komme ud og op i luften.",
      },
      {
        name: "Almindelig drone",
        text: "Fx en DJI. Flotte skud udefra og oppefra, men den kan ikke flyve ind i huset.",
      },
      {
        name: "FPV-drone",
        text: "Ét sammenhængende skud, inde fra og ud: gennem døre, tæt forbi møbler og op over taget.",
        best: true,
      },
    ],
    bestNote: "det er det, FPV kan",
    marketingTitle: "Det betyder for jeres markedsføring",
    marketing: [
      "Folk stopper op: bevægelse helt tæt på fanger blikket i et feed fyldt med stillbilleder.",
      "Køberne forstår boligen før fremvisningen, så dem der kommer, ved hvad de kommer til.",
      "Ét skud kan klippes til Reels, TikTok, annoncer og jeres hjemmeside.",
      "I skiller jer ud fra konkurrenterne, der viser de samme billeder som alle andre.",
    ],
  },
  en: {
    title: "Why FPV?",
    lead: "Photos show one room at a time, and it can be hard to sense what a house is like inside: how big the rooms are and how they sit next to each other. An FPV drone flies [all the way through in one shot]: in through the door, across the living room, up the stairs and out over the roof. You get *the whole experience*.",
    compare: [
      { name: "Photos", text: "One room at a time. You have to guess how it all fits together." },
      { name: "Handheld camera", text: "Gets around inside, but it's slow, shaky and can't go outside and up into the air." },
      { name: "Regular drone", text: "Like a DJI. Great shots from outside and above, but it can't fly into the house." },
      {
        name: "FPV drone",
        text: "One continuous shot, from inside to out: through doors, close past furniture and up over the roof.",
        best: true,
      },
    ],
    bestNote: "that's what FPV can do",
    marketingTitle: "What it means for your marketing",
    marketing: [
      "People stop scrolling: close-up motion catches the eye in a feed full of still photos.",
      "Buyers understand the home before the viewing, so the people who come know what they're coming to.",
      "One shot can be cut for Reels, TikTok, ads and your website.",
      "You stand out from competitors who show the same photos as everyone else.",
    ],
  },
};

/* Why FPV video beats photos, a handheld camera and a regular camera drone for showing a
   place (above all a home), and what that does for a business's marketing. Peter asked for
   this next to Uddannelse / Kompetencer. */
export function WhyFpv() {
  const t = useT(texts);
  return (
    <Sheet>
      <div className="mg-why">
        <Heading text={t.title} seed={15} />
        <p className="mg-p mg-why-lead" data-ink>
          <Marked text={t.lead} seed={140} />
        </p>

        <ol className="mg-compare" data-ink>
          {t.compare.map((c, i) => (
            <li key={c.name} className={"mg-compare-item" + (c.best ? " mg-compare-best" : "")}>
              <span className="mg-compare-n mg-hand">{i + 1}</span>
              <h3 className="mg-compare-name">
                {c.best ? (
                  <span className="mg-mk">
                    {c.name}
                    <PenMark kind="oval" seed={60} padX={12} padY={8} delay={0.9} />
                  </span>
                ) : (
                  c.name
                )}
              </h3>
              <p className="mg-compare-text">{c.text}</p>
              {c.best ? (
                <div className="mg-compare-note mg-hand" aria-hidden="true">
                  <svg viewBox="0 0 70 50" className="mg-ink">
                    <Arrow a={[62, 44]} b={[14, 8]} bend={-0.3} head={8} delay={1.3} />
                  </svg>
                  <Write delay={1.6}>{t.bestNote}</Write>
                </div>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mg-why-low">
          <h3 className="mg-display mg-why-h3">{t.marketingTitle}</h3>
          <ul className="mg-skill-list mg-why-list">
            {t.marketing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
