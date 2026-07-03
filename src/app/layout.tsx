import { SheetFrame } from "@/components/backgrounds/sheet-frame";
import { AccentSpy } from "@/components/site/accent-spy";
import { CommandPalette } from "@/components/site/command-palette";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { TopNav } from "@/components/site/top-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { DATA } from "@/data/resume";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/** Display: characterful at large sizes, tight at 800. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz"],
  display: "swap",
});

/** Reading and UI. */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

/** Anything a machine would print: dates, tags, counters, code. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  openGraph: {
    title: DATA.name,
    description: DATA.description,
    url: SITE_URL,
    siteName: DATA.name,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  twitter: { title: DATA.name, card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Without JavaScript, show text that would otherwise wait for a scroll reveal */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={cn("min-h-screen font-sans antialiased", bricolage.variable, geist.variable, jetbrains.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-bg"
          >
            Skip to content
          </a>
          <SheetFrame />
          <TopNav />
          <div className="relative z-[1]">{children}</div>
          <CommandPalette />
          <SmoothScroll />
          <AccentSpy />
        </ThemeProvider>
      </body>
    </html>
  );
}
