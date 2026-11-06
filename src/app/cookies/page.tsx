import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CookiePolicy } from "@/components/cookie-policy";

export const metadata: Metadata = pageMetadata({
  title: "Cookies",
  description:
    "Hvordan frolovfpv.com bruger cookies og lokal lagring.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <main className="flex-1">
      <CookiePolicy />
    </main>
  );
}
