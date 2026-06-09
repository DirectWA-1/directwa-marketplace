import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2E8B57] text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Buy & Sell Locally in South Africa
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Connect directly with buyers and sellers. No middleman fees. Fast, local, and trustworthy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/listings" 
              className="inline-block bg-white text-[#1E3A5F] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Browse Listings
            </Link>
            <Link 
              href="/create-listing" 
              className="inline-block bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors"
            >
              Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Trust Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Direct Connection</h3>
            <p className="text-gray-600">Chat directly with buyers and sellers via WhatsApp. No middleman.</p>
          </div>
          <div>
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-gray-600">Built-in escrow protection for high-value transactions.</p>
          </div>
          <div>
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2">Local Focus</h3>
            <p className="text-gray-600">Built for South Africa. Fast local deliveries and meetups.</p>
          </div>
        </div>
      </section>
    </div>
  );
}