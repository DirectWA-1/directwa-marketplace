import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer"; // Optional if you have one

export const metadata: Metadata = {
  title: {
    default: "DirectWA - Buy & Sell Locally in South Africa",
    template: "%s | DirectWA",
  },
  description: "DirectWA is a simple C2C marketplace connecting buyers and sellers directly via WhatsApp in South Africa. No middleman fees.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        {children}
        {/* <Footer /> */} {/* Uncomment if you have a Footer component */}
        <Analytics />
      </body>
    </html>
  );
}