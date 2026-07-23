import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { AppProviders } from "@/shared/providers/app-providers";
import { themeModeInitScript } from "@/shared/theme";
import { AppHeader } from "@/shared/ui/app-header";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-heading-family",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body-family",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-code-family",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pricing Optimizer",
  description: "Paste a product URL, get three AI-generated pricing pages, streamed live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Static theme scope so the pre-compiled theme CSS (globals.css) applies on
      // first paint, before <Theme> mounts — the generated rules are scoped to
      // [data-astryx-theme="pricing-optimizer"]. The theme name is constant.
      data-astryx-theme="pricing-optimizer"
      // themeModeInitScript below sets data-theme on this element before hydration to
      // avoid a flash of the wrong theme; suppress the resulting, expected mismatch
      // warning rather than have React fight the intentional pre-hydration mutation.
      suppressHydrationWarning
      className={`${bricolageGrotesque.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: render-blocking, no user input, avoids a theme flash before hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeModeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-body">
        <AppProviders>
          <AppHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
