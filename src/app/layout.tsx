import type { Metadata } from "next";
import { Caveat, DM_Serif_Display, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MobileDock } from "@/components/mobile-dock";
import { LangProvider } from "@/lib/lang";
import { SmoothScroll } from "@/lib/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// serif for the headings
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// the notebook sections on the front page: big high-contrast serif headings and a handwritten pen
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Frolov FPV | FPV-dronefilm til virksomheder",
  description:
    "FPV-dronefilm til virksomheder: indhold til sociale medier, one-takes og house tours til ejendomsmæglere. Få et tilbud.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="da"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dmSerif.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground pb-[calc(max(14px,env(safe-area-inset-bottom))+76px)] md:pb-0">
        <LangProvider>
          <SmoothScroll
            header={
              <>
                <Navbar />
                <MobileDock />
              </>
            }
          >
            {children}
            <Footer />
          </SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
