"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/lang";
import { GenieLink } from "@/lib/smooth-scroll";
import { SpiderShotLayer } from "@/components/ui/spider-shot";

const texts = {
  da: {
    before: "Lad os arbejde ",
    accent: "sammen",
    lead: "Har du et projekt i tankerne? Jeg vil meget gerne høre om det. Tag fat i mig, så skaber vi noget episk sammen.",
    cta: "Kontakt mig",
  },
  en: {
    before: "Let's work ",
    accent: "together",
    lead: "Got a project in mind? I'd love to hear about it. Get in touch and let's create something epic together.",
    cta: "Contact me",
  },
};

export function Contact() {
  const panel = useRef<HTMLDivElement>(null);
  const btnBox = useRef<HTMLDivElement>(null);
  const btnLean = useRef<HTMLDivElement>(null);
  const t = useT(texts);

  return (
    <section id="contact" className="px-5 md:px-10">
      <div ref={panel} className="relative mx-auto max-w-[1360px] py-28 text-center md:py-40">
        {/* after 5 s standing still a stickman pops out of the button, webs the mouse and yanks it onto the button */}
        <SpiderShotLayer areaRef={panel} targetRef={btnBox} leanRef={btnLean} />

        <div className="relative">
          <h2 className="font-serif text-[clamp(56px,8vw,120px)] leading-[0.95]">
            {t.before}
            <em>{t.accent}</em>
          </h2>
          <p className="mx-auto mb-10 mt-6 max-w-[46ch] text-muted-foreground">{t.lead}</p>

          <div className="flex justify-center">
            <div ref={btnBox} className="inline-flex">
              <div ref={btnLean} className="inline-flex will-change-transform">
                <GenieLink
                  href="/kontakt"
                  className="group inline-flex h-14 items-center gap-2.5 rounded-full bg-primary px-8 font-medium text-primary-foreground transition-colors hover:bg-neutral-700"
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
