import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "DirectWA | South Africa's WhatsApp Marketplace",
    template: "%s | DirectWA",
  },
  description: "Buy and sell locally on WhatsApp. No store fees. Chat directly with sellers. Safe deals with optional escrow protection.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "DirectWA - Direct deals. WhatsApp simple.",
    description: "South Africa's hybrid marketplace. Browse on the web. Negotiate and complete deals directly on WhatsApp.",
    images: [{ url: "/og-image.jpg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />

        <main className="min-h-screen bg-gray-50">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}