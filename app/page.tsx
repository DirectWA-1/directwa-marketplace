import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      {/* Hero Section with Logo */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2E8B57] text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          
          {/* Logo in Hero */}
          <div className="flex justify-center mb-8">
            <Image 
              src="/logo.png" 
              alt="DirectWA" 
              width={220} 
              height={62} 
              className="h-14 w-auto brightness-0 invert"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Buy & Sell Locally.<br />Directly on WhatsApp.
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            No middlemen. No hidden fees. Just simple, safe, and direct transactions 
            between real people in South Africa.
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
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* You can continue adding other sections below */}
    </div>
  );
}