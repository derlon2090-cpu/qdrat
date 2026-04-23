import type { Metadata } from "next";

import { SearchOverlay } from "@/components/search-overlay";
import "./globals.css";

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
      <body className="miyaar-grid">
        {children}
        <SearchOverlay />
      </body>
    </html>
  );
}
