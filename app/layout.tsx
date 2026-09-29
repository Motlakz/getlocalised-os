import type { Metadata } from "next";
import { Geist_Mono, Merriweather, Raleway, Source_Sans_3 } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"] });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"] });
const merriweather = Merriweather({ variable: "--font-merriweather", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "GetLocalised OS", template: "%s · GetLocalised OS" },
  description:
    "Open-source localization agent for mobile apps. Turn a Play Store listing into a native one, shaped by skills you can read.",
};

/** Sets `.dark` from the system preference before paint, so there is no flash. */
const themeScript = `(() => {
  const m = matchMedia("(prefers-color-scheme: dark)");
  const set = () => document.documentElement.classList.toggle("dark", m.matches);
  set(); m.addEventListener("change", set);
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
