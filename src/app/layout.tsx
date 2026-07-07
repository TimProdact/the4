import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "The4 — SHIZARU OKSANA",
  description: "1st Edition. Limited drop.",
  robots: "noindex",
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
