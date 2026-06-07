import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DirectWA - Buy & Sell Locally in South Africa",
  description: "DirectWA is a simple C2C marketplace that connects buyers and sellers directly via WhatsApp. No middleman fees. Fast, local, and trustworthy.",
  icons: {
    icon: "/favicon.ico",
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}