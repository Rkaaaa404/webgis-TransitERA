import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TransitERA | TOD Readiness & Land Value Intelligence — Surabaya",
  description:
    "Platform WebGIS interaktif berbasis Decision Support System untuk menilai kesiapan kawasan Transit-Oriented Development (TOD) dan keterkaitannya dengan nilai lahan di Kota Surabaya. Dibangun oleh Tim TransitERA.",
  keywords: [
    "TransitERA",
    "WebGIS",
    "TOD",
    "Transit-Oriented Development",
    "Surabaya",
    "MAPID",
    "H3 Hexagonal Grid",
    "Spatial AI",
    "NJOP",
    "Nilai Lahan",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
