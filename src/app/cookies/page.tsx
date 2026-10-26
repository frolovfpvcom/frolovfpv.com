import type { Metadata } from "next";
import { CookiePolicy } from "@/components/cookie-policy";

export const metadata: Metadata = {
  title: "Cookies | Frolov FPV",
  description: "Hvordan frolovfpv.com bruger cookies og lokal lagring.",
};

export default function CookiesPage() {
  return (
    <main className="flex-1">
      <CookiePolicy />
    </main>
  );
}
