import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-8 text-center">How DirectWA Works</h1>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">1. Browse or List Items</h2>
          <p className="text-gray-700">Search for items you want to buy or create a listing to sell something you no longer need.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">2. Connect Directly via WhatsApp</h2>
          <p className="text-gray-700">Chat directly with the other party. No middleman fees or hidden charges.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">3. Safe Transactions with Escrow</h2>
          <p className="text-gray-700">
            For transactions above R2,000 or when buying/selling high-value or used items, we recommend using our escrow service.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/create-listing" 
          className="inline-block bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-4 rounded-2xl font-semibold text-lg"
        >
          Start Selling Now
        </Link>
      </div>
    </div>
  );
}