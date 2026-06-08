import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000"
  ),
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
        <script
          defer
          data-domain="directwa-marketplace-n85e.vercel.app"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body className="bg-gray-50 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1">
          {children}
        </main>

        {/* Simple Footer */}
        <footer className="bg-[#1E3A5F] text-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm">
            <p>© {new Date().getFullYear()} DirectWA. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <a href="/about" className="hover:underline">About</a>
              <a href="/how-it-works" className="hover:underline">How it Works</a>
              <a href="/terms" className="hover:underline">Terms</a>
              <a href="/privacy" className="hover:underline">Privacy</a>
            </div>
          </div>
        </footer>

        <Toaster position="top-center" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}