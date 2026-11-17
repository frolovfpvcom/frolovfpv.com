"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/lib/lang";

const texts = {
  da: {
    dealer: {
      tag: "Nyhed",
      title: "Den nye SUV er landet",
      sub: "Se den i fart, før du ser den hos os.",
      price: "Fra 389.900 kr.",
      cta: "Book prøvetur",
      menu: ["Nye biler", "Brugte", "Værksted"],
      perks: ["Hybrid", "Firehjulstræk", "7 års garanti"],
      more: "Flere biler på lager",
    },
    listing: {
      badge: "House tour",
      price: "3.495.000 kr.",
      kind: "Villa",
      place: "Egevænget · Fyn",
      specs: ["162 m²", "5 vær.", "Grund 812 m²"],
      cta: "Book fremvisning",
      fav: "Gem",
      agent: "Din ejendomsmægler",
      call: "Ring op",
    },
  },
  en: {
    dealer: {
      tag: "New",
      title: "The new SUV has landed",
      sub: "See it in motion before you see it with us.",
      price: "From 389,900 kr.",
      cta: "Book a test drive",
      menu: ["New cars", "Used", "Service"],
      perks: ["Hybrid", "All-wheel drive", "7-year warranty"],
      more: "More cars in stock",
    },
    listing: {
      badge: "House tour",
      price: "3,495,000 kr.",
      kind: "Villa",
      place: "Egevænget · Funen",
      specs: ["162 m²", "5 rooms", "Plot 812 m²"],
      cta: "Book a viewing",
      fav: "Save",
      agent: "Your estate agent",
      call: "Call",
    },
  },
};

type Clip = { video: string; poster: string };
type Screen = "dealer" | "listing" | "reel";

/* One phone per service, in the same order as the services: a made-up car dealer site for
   social media content, an upright clip full screen for one-takes, and a made-up property site
   for house tours. */
export type PhoneSpec = { clip: Clip; screen: Screen };
export const phones: PhoneSpec[] = [
  { clip: { video: "/clips/telefon-roed-bil.mp4", poster: "/clips/telefon-roed-bil.jpg" }, screen: "dealer" },
  { clip: { video: "/clips/telefon-pande-ram.mp4", poster: "/clips/telefon-pande-ram.jpg" }, screen: "reel" },
  { clip: { video: "/clips/telefon-house-tour-43.mp4", poster: "/clips/telefon-house-tour-43.jpg" }, screen: "listing" },
];

/** A muted, looping clip that only plays while `play` is on. */
function Clip({ clip, label, play, className }: { clip: Clip; label: string; play: boolean; className: string }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (play) {
      v.preload = "auto";
      v.play().catch(() => {});
    } else v.pause();
  }, [play]);
  return (
    <video ref={video} muted loop playsInline preload="none" poster={clip.poster} aria-label={label} className={className}>
      <source src={clip.video} type="video/mp4" />
    </video>
  );
}

/* Everything inside a screen is sized in cqw (1 % of the screen's width), so the little website
   looks the same whether the phone is 110 or 280 pixels wide. */

/** The clock and the signal/battery marks at the very top of the screen. */
function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={`flex h-[15cqw] items-center justify-between px-[8cqw] pt-[1cqw] text-[3.6cqw] font-semibold ${dark ? "text-white" : "text-neutral-900"}`}>
      <span>9:41</span>
      <span className="flex items-center gap-[1.4cqw]" aria-hidden="true">
        <span className="flex items-end gap-[0.6cqw]">
          {[1.4, 2, 2.6, 3.2].map((h) => (
            <span key={h} className="w-[0.9cqw] rounded-[0.3cqw] bg-current" style={{ height: `${h}cqw` }} />
          ))}
        </span>
        <span className="relative h-[3cqw] w-[6cqw] rounded-[0.9cqw] border-[0.4cqw] border-current">
          <span className="absolute inset-[0.4cqw] right-[1.4cqw] rounded-[0.3cqw] bg-current" />
        </span>
      </span>
    </div>
  );
}

/** The browser's address field. */
function UrlBar({ host }: { host: string }) {
  return (
    <div className="mx-[4cqw] flex h-[8cqw] items-center justify-center gap-[1.4cqw] rounded-[2.4cqw] bg-neutral-100 text-[3.4cqw] text-neutral-700">
      <svg viewBox="0 0 12 12" className="h-[2.8cqw] w-[2.8cqw]" aria-hidden="true">
        <rect x="2" y="5.2" width="8" height="5.6" rx="1.2" fill="currentColor" />
        <path d="M3.8 5.4V4a2.2 2.2 0 0 1 4.4 0v1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      {host}
    </div>
  );
}

/** A made-up car dealer's page with the red car clip as its big picture. */
function DealerScreen({ clip, label, play }: { clip: Clip; label: string; play: boolean }) {
  const t = useT(texts).dealer;
  return (
    <div className="flex h-full flex-col bg-white text-[#14213d]">
      <StatusBar />
      <UrlBar host="motorlinjen.dk" />
      <div className="flex items-center justify-between px-[5cqw] pb-[2.5cqw] pt-[3.5cqw]">
        <span className="text-[5.2cqw] font-extrabold tracking-tight">
          MOTOR<span className="text-[#c8102e]">LINJEN</span>
        </span>
        <span className="flex flex-col gap-[0.9cqw]" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[0.6cqw] w-[4.4cqw] rounded-full bg-current" />
          ))}
        </span>
      </div>
      <div className="flex gap-[3.5cqw] px-[5cqw] pb-[3cqw] text-[3.2cqw] text-[#14213d]/60">
        {t.menu.map((m, i) => (
          <span key={m} className={i === 0 ? "font-semibold text-[#14213d]" : ""}>
            {m}
          </span>
        ))}
      </div>
      <div className="relative aspect-[4/3] w-full bg-neutral-800">
        <Clip clip={clip} label={label} play={play} className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute left-[4cqw] top-[4cqw] rounded-[1cqw] bg-[#c8102e] px-[2.2cqw] py-[0.8cqw] text-[3cqw] font-bold uppercase tracking-wide text-white">
          {t.tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-[5cqw] pt-[4.5cqw]">
        <p className="text-[6.4cqw] font-extrabold leading-[1.1]">{t.title}</p>
        <p className="mt-[1.8cqw] text-[3.6cqw] leading-snug text-[#14213d]/65">{t.sub}</p>
        <p className="mt-[3.5cqw] text-[4.6cqw] font-bold">{t.price}</p>
        <span className="mt-[4cqw] flex h-[10cqw] items-center justify-center rounded-[2cqw] bg-[#c8102e] text-[3.8cqw] font-semibold text-white">
          {t.cta}
        </span>
        <div className="mt-[4cqw] flex flex-wrap gap-[1.6cqw]">
          {t.perks.map((perk) => (
            <span key={perk} className="rounded-full border-[0.4cqw] border-[#14213d]/15 px-[2.2cqw] py-[0.8cqw] text-[2.9cqw]">
              ✓ {perk}
            </span>
          ))}
        </div>
        <p className="mt-[5cqw] text-[3.6cqw] font-bold">{t.more}</p>
        <div className="mt-[2cqw] grid grid-cols-3 gap-[2cqw]">
          {["38% 50%", "62% 50%", "50% 30%"].map((pos) => (
            <span
              key={pos}
              className="aspect-[4/3] rounded-[1.6cqw] bg-neutral-300 bg-cover"
              style={{ backgroundImage: `url(${clip.poster})`, backgroundPosition: pos, backgroundSize: "220%" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** A made-up property site's listing with the house tour as its main video. */
function ListingScreen({ clip, label, play }: { clip: Clip; label: string; play: boolean }) {
  const t = useT(texts).listing;
  return (
    <div className="flex h-full flex-col bg-white text-neutral-900">
      <StatusBar />
      <UrlBar host="boligblik.dk" />
      <div className="flex items-center justify-between px-[5cqw] pb-[3cqw] pt-[3.5cqw]">
        <span className="flex items-center gap-[1.6cqw] text-[5.2cqw] font-bold tracking-tight text-[#1d554a]">
          <svg viewBox="0 0 16 16" className="h-[5cqw] w-[5cqw]" aria-hidden="true">
            <path d="M2 7.4 8 2.5l6 4.9V14H2Z" fill="#1d554a" />
            <circle cx="8" cy="9.4" r="2.1" fill="#fff" />
          </svg>
          boligblik
        </span>
        <span className="flex items-center gap-[1cqw] rounded-full border-[0.4cqw] border-neutral-300 px-[2.4cqw] py-[0.8cqw] text-[3cqw] text-neutral-600">
          ♡ {t.fav}
        </span>
      </div>
      <div className="relative mx-[4cqw] aspect-[4/3] overflow-hidden rounded-[2.4cqw] bg-neutral-800">
        <Clip clip={clip} label={label} play={play} className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute bottom-[3cqw] left-[3cqw] flex items-center gap-[1.2cqw] rounded-full bg-white/95 px-[2.4cqw] py-[1cqw] text-[3cqw] font-semibold text-neutral-900">
          <span className="h-[1.8cqw] w-[1.8cqw] rounded-full bg-[#e5484d]" />
          {t.badge}
        </span>
        <span className="absolute bottom-[3cqw] right-[3cqw] rounded-full bg-black/55 px-[2cqw] py-[0.8cqw] text-[2.8cqw] text-white">1/24</span>
      </div>
      <div className="flex flex-1 flex-col px-[5cqw] pt-[4cqw]">
        <p className="text-[3.2cqw] font-medium uppercase tracking-wide text-[#1d554a]">{t.kind}</p>
        <p className="mt-[1cqw] text-[6.6cqw] font-extrabold leading-none">{t.price}</p>
        <p className="mt-[1.4cqw] text-[3.4cqw] text-neutral-500">{t.place}</p>
        <div className="mt-[3cqw] flex gap-[2cqw]">
          {t.specs.map((spec) => (
            <span key={spec} className="rounded-[1.4cqw] bg-neutral-100 px-[2cqw] py-[1cqw] text-[3cqw] text-neutral-700">
              {spec}
            </span>
          ))}
        </div>
        <span className="mt-[4.5cqw] flex h-[10cqw] items-center justify-center rounded-[2cqw] bg-[#1d554a] text-[3.8cqw] font-semibold text-white">
          {t.cta}
        </span>
        <div className="mt-[4cqw] grid grid-cols-3 gap-[2cqw]">
          {["20% 40%", "55% 60%", "85% 40%"].map((pos) => (
            <span
              key={pos}
              className="aspect-square rounded-[1.6cqw] bg-neutral-300 bg-cover"
              style={{ backgroundImage: `url(${clip.poster})`, backgroundPosition: pos, backgroundSize: "260%" }}
            />
          ))}
        </div>
        <div className="mt-[4cqw] flex items-center gap-[2.4cqw] rounded-[2.4cqw] border-[0.4cqw] border-neutral-200 p-[2.4cqw]">
          <span className="h-[8cqw] w-[8cqw] shrink-0 rounded-full bg-[#1d554a]/15" />
          <span className="flex-1 text-[3.2cqw] font-medium">{t.agent}</span>
          <span className="rounded-full bg-neutral-100 px-[2.4cqw] py-[1cqw] text-[3cqw] font-semibold text-[#1d554a]">{t.call}</span>
        </div>
      </div>
    </div>
  );
}

/** A phone drawn in CSS, showing one of the screens above. */
export function Phone({ phone, label, play }: { phone: PhoneSpec; label: string; play: boolean }) {
  return (
    <div className="relative aspect-[9/19.5] w-full rounded-[18%/8.3%] bg-[#0d0e10] p-[4.5%] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
      <div className="relative h-full w-full overflow-hidden rounded-[14%/6.5%] bg-neutral-800 [container-type:inline-size]">
        {phone.screen === "dealer" ? (
          <DealerScreen clip={phone.clip} label={label} play={play} />
        ) : phone.screen === "listing" ? (
          <ListingScreen clip={phone.clip} label={label} play={play} />
        ) : (
          <Clip clip={phone.clip} label={label} play={play} className="absolute inset-0 h-full w-full object-cover" />
        )}
        {/* the little pill at the top of the screen */}
        <span aria-hidden="true" className="absolute left-1/2 top-[2.5%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-[#0d0e10]" />
      </div>
    </div>
  );
}
