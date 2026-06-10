import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppNav } from "@/components/nav/app-nav";
import { AppProviders } from "@/components/providers/app-providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "to the world",
  description: "Private mobility command center for funded international opportunities."
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppProviders>
          <div className="app-shell">
            <AppNav />
            <main className="app-main">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
