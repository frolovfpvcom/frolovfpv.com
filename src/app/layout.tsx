import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LangProvider } from "@/lib/lang";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { CatIntro } from "@/components/cat-intro";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frolov FPV | Dronefilm",
  description:
    "Professionel FPV-dronefilm — filmiske luftoptagelser, medrivende footage og kreativ historiefortælling fra oven.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="da"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Decide before the first paint whether the cat intro plays: once per tab,
            never with reduced motion, always with ?intro in the address. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var f=/[?&]intro\b/.test(location.search),k="frolov-intro";if(f||(!sessionStorage.getItem(k)&&!matchMedia("(prefers-reduced-motion: reduce)").matches)){document.documentElement.setAttribute("data-intro","play");sessionStorage.setItem(k,"1")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LangProvider>
          <CatIntro />
          <SmoothScroll header={<Navbar />}>
            {children}
            <Footer />
          </SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
