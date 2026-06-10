import Link from 'next/link';
import { Handshake, ShieldCheck, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2E8B57] text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Buy & Sell Locally in South Africa
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Connect directly with buyers and sellers. No middleman fees.<br />
            Fast, local, and trustworthy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/listings" 
              className="bg-white text-[#1E3A5F] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition"
            >
              Browse Listings
            </Link>
            <Link 
              href="/create-listing" 
              className="border-2 border-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-[#1E3A5F] transition"
            >
              Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* === NEW SECTION: Three Feature Cards === */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Direct Connection */}
          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Handshake className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#1E3A5F] mb-3">Direct Connection</h3>
            <p className="text-gray-600">
              Chat directly with buyers and sellers via WhatsApp. No middleman.
            </p>
          </div>

          {/* Safe & Secure */}
          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#1E3A5F] mb-3">Safe & Secure</h3>
            <p className="text-gray-600">
              Built-in escrow protection for high-value transactions.
            </p>
          </div>

          {/* Local Focus */}
          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#1E3A5F] mb-3">Local Focus</h3>
            <p className="text-gray-600">
              Built for South Africa. Fast local deliveries and meetups.
            </p>
          </div>

        </div>
      </section>

      {/* You can continue adding more sections below (e.g. How it Works, Featured Listings, etc.) */}
    </div>
  );
}