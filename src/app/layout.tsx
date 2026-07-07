import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://the4-drop.netlify.app"),
  title: "The4 — SHIZARU OKSANA",
  description: "1st Edition. Limited drop.",
  robots: "noindex",
  openGraph: {
    title: "THE4 — SHIZARU OKSANA",
    description: "1st Edition · Limited drop",
    url: "https://the4-drop.netlify.app",
    siteName: "THE4",
    images: [{ url: "/og-drop.png", width: 1200, height: 630, alt: "SHIZARU OKSANA" }],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "THE4 — SHIZARU OKSANA",
    description: "1st Edition · Limited drop",
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
