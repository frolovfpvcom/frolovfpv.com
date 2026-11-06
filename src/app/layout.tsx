import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LangProvider } from "@/lib/lang";
import { SmoothScroll } from "@/lib/smooth-scroll";
import { HOME_DESCRIPTION, HOME_TITLE, IMAGES, KEYWORDS, SITE_NAME, SITE_URL, jsonLd, siteGraph } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | Frolov FPV",
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: "Peter Frolov", url: `${SITE_URL}/ommig` }],
  creator: "Peter Frolov",
  publisher: SITE_NAME,
  category: "Dronefilm",
  openGraph: {
    type: "website",
    locale: "da_DK",
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [{ url: IMAGES.share.src, width: IMAGES.share.width, height: IMAGES.share.height, alt: IMAGES.share.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [IMAGES.share.src],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
  },
  // Google Search Console: set GOOGLE_SITE_VERIFICATION in Vercel to the code Google gives you.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="da"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* who is behind the site, for Google: Frolov FPV, Peter Frolov and the website */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteGraph) }} />
        <LangProvider>
          <SmoothScroll header={<Navbar />}>
            {children}
            <Footer />
          </SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
