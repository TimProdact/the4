import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://timprodact.github.io/the4"),
  title: "The4 — Limited Drop",
  description: "Limited drop. 3D gallery.",
  robots: "noindex",
  openGraph: {
    title: "THE4 — Limited Drop",
    description: "Limited drop · 3D gallery",
    url: "https://timprodact.github.io/the4",
    siteName: "THE4",
    images: [{ url: "/og-drop.png", width: 1200, height: 630, alt: "THE4" }],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "THE4 — Limited Drop",
    description: "Limited drop · 3D gallery",
    images: ["/og-drop.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#e8e6e1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
