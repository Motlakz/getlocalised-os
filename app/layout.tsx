import type { Metadata } from "next";
import { Geist_Mono, Merriweather, Raleway, Source_Sans_3 } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"] });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"] });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Open-source localization agent for mobile apps. Turn a Google Play listing into a native one for every market, shaped by skills you can read.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "GetLocalised OS · Native listings, not translations", template: "%s · GetLocalised OS" },
  description,
  openGraph: { title: "GetLocalised OS", description, url: SITE_URL, siteName: "GetLocalised OS", type: "website" },
  twitter: { card: "summary_large_image", title: "GetLocalised OS", description },
};

/** Dark by default; a saved choice from the theme toggle wins. Runs before paint, so there is no flash. */
const themeScript = `(() => {
  let theme = "dark";
  try { theme = localStorage.getItem("theme") || "dark"; } catch {}
  document.documentElement.classList.toggle("dark", theme !== "light");
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${raleway.variable} ${sourceSans.variable} ${merriweather.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
