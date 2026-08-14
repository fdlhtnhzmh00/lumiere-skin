import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import React from "react";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ─── Google Fonts ─────────────────────────────────────────────
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ─── Metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "LUMIÈRE SKIN — Illuminate Your Natural Beauty",
    template: "%s | LUMIÈRE SKIN",
  },
  description:
    "Toko skincare premium dengan koleksi produk perawatan kulit terbaik. Temukan rutinitas skincare sempurna Anda bersama LUMIÈRE SKIN.",
  keywords: ["skincare", "kecantikan", "perawatan kulit", "lumiere skin", "serum", "moisturizer"],
  openGraph: {
    title: "LUMIÈRE SKIN — Illuminate Your Natural Beauty",
    description: "Toko skincare premium dengan koleksi produk perawatan kulit terbaik.",
    siteName: "LUMIÈRE SKIN",
    locale: "id_ID",
    type: "website",
  },
};

// ─── Root Layout ──────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-warm-50 text-warm-900 font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
