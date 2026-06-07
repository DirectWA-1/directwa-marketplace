import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: {
    default: "DirectWA - Buy & Sell Locally in South Africa",
    template: "%s | DirectWA",
  },
  description: "DirectWA is a simple C2C marketplace connecting buyers and sellers directly via WhatsApp in South Africa. No middleman fees. Fast, local, and trustworthy.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "DirectWA - Buy & Sell Locally in South Africa",
    description: "DirectWA is a simple C2C marketplace connecting buyers and sellers directly via WhatsApp. No middleman fees.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DirectWA - Buy & Sell Locally in South Africa",
    description: "DirectWA is a simple C2C marketplace connecting buyers and sellers directly via WhatsApp.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Plausible Analytics */}
        <script
          defer
          data-domain="directwa-marketplace-n85e.vercel.app"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body className="bg-gray-50">
        <Navbar />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}