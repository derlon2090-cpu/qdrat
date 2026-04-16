import type { Metadata } from "next";
import { Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";

import "./globals.css";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "معيار | منصة عربية ذكية للتحضير للقدرات",
  description:
    "معيار منصة عربية فاخرة للتحضير لاختبار القدرات: بنوك أسئلة، خطة ذكية، مراجعة مركزة، ولوحة طالب واضحة.",
  icons: {
    icon: "/logo-miyaar.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${alexandria.variable} ${ibmPlexArabic.variable} miyaar-grid`}>
        {children}
      </body>
    </html>
  );
}
