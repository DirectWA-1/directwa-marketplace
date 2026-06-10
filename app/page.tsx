import Link from 'next/link';

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

      {/* You can add more sections below (Featured, How it Works, etc.) */}
    </div>
  );
}