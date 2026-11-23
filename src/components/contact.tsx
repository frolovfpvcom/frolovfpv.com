"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";
import { SpiderShotLayer } from "@/components/ui/spider-shot";

const texts = {
  da: {
    before: "Skal jeres virksomhed ",
    accent: "ses",
    after: "?",
    lead: "Fortæl mig hvad I vil vise, hvor og hvornår. Så vender jeg tilbage med en idé og en pris.",
    cta: "Få et tilbud",
  },
  en: {
    before: "Should your business get ",
    accent: "seen",
    after: "?",
    lead: "Tell me what you want to show, where and when. I'll come back with an idea and a price.",
    cta: "Get a quote",
  },
};

export function Contact() {
  const panel = useRef<HTMLDivElement>(null);
  const btnBox = useRef<HTMLDivElement>(null);
  const btnLean = useRef<HTMLDivElement>(null);
  const t = useT(texts);

  return (
    <section id="contact" className="px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
      {/* a blue panel, so the last thing on the page is the ask, and it stands out */}
      <div
        ref={panel}
        className="relative mx-auto max-w-[1360px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#1d44b8] to-brand-deep px-5 py-24 text-center text-white md:py-32"
      >
        {/* after 5 s standing still a stickman pops out of the button, webs the mouse and yanks it onto the button */}
        <SpiderShotLayer areaRef={panel} targetRef={btnBox} leanRef={btnLean} />

        <div className="relative">
          <h2 className="font-serif text-[clamp(56px,8vw,120px)] leading-[0.95]">
            {t.before}
            <em>{t.accent}</em>
            {t.after}
          </h2>
          <p className="mx-auto mb-10 mt-6 max-w-[46ch] text-white/80">{t.lead}</p>

          <div className="flex justify-center">
            <div ref={btnBox} className="inline-flex">
              <div ref={btnLean} className="inline-flex will-change-transform">
                <GenieLink
                  href="/kontakt"
                  className="group inline-flex h-14 items-center gap-2.5 rounded-full bg-white px-8 font-medium text-brand-deep transition-colors hover:bg-brand-soft"
                >
                  {t.cta}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </GenieLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
