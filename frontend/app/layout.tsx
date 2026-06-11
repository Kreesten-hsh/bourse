import type { Metadata } from "next";

import { AppNav } from "@/components/nav/app-nav";
import { AppProviders } from "@/components/providers/app-providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "to the world",
  description: "Private mobility command center for funded international opportunities."
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body>
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded focus:bg-surface-container-lowest focus:px-4 focus:py-2 focus:text-label-md focus:text-primary focus:shadow-focus"
          >
            Aller au contenu
          </a>
          <div className="app-shell">
            <AppNav />
            <main id="main-content" className="app-main" tabIndex={-1}>
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
