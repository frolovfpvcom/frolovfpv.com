"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/sections/page-header";
import { useT } from "@/lib/lang";

const texts = {
  da: { eyebrow: "Fejl 404", title: "Mistet signal", lead: "Siden findes ikke, eller også er den fløjet videre.", home: "Til forsiden" },
  en: { eyebrow: "Error 404", title: "Signal lost", lead: "The page doesn't exist, or it has flown off.", home: "To the front page" },
};

export function NotFound() {
  const t = useT(texts);
  return (
    <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <ButtonLink href="/" className="mt-10">
        {t.home}
      </ButtonLink>
    </PageHeader>
  );
}
