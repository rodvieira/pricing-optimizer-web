import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeModeProvider, themeModeInitScript } from "@/features/theme/theme-mode-provider";
import { QueryProvider } from "@/lib/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: render-blocking, no user input, avoids a theme flash before hydration */}
        <script dangerouslySetInnerHTML={{ __html: themeModeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
