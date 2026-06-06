import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DirectWA Marketplace",
  description: "Direct deals. WhatsApp simple. Marketplace safe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Simple Navbar */}
        <nav className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#1E3A5F] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="font-bold text-xl text-[#1E3A5F]">DirectWA</span>
            </Link>

            <div className="flex items-center gap-4 text-sm">
              <Link href="/listings" className="text-gray-600 hover:text-[#1E3A5F]">Browse</Link>
              <Link href="/sell" className="text-gray-600 hover:text-[#1E3A5F]">Sell</Link>
              <Link href="/login" className="bg-[#1E3A5F] text-white px-4 py-2 rounded-xl text-sm">Log in</Link>
            </div>
          </div>
        </nav>

        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}