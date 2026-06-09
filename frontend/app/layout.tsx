import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
