import type { Metadata } from "next";
import { site } from "@/config/site";
import { siteUrl } from "@/lib/seo";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} · Developer & Security Researcher`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: { siteName: site.name, locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a className="skip-link" href="#main">
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
