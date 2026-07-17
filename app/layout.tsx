import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { AppHeader } from "@/components/ui/app-header";
import { ThemeModeProvider, themeModeInitScript } from "@/features/theme/theme-mode-provider";
import { QueryProvider } from "@/lib/query-provider";
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
      className={`${bricolageGrotesque.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: render-blocking, no user input, avoids a theme flash before hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeModeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeModeProvider>
            <AppHeader />
            {children}
          </ThemeModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
