export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-4 text-center">How DirectWA Works</h1>
      <p className="text-center text-gray-600 mb-12">Simple. Fast. Safe.</p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-[#2E8B57] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-5">
            01
          </div>
          <h3 className="font-semibold text-xl mb-3 text-[#1E3A5F]">Browse or Search</h3>
          <p className="text-gray-600">
            Find items from verified sellers across South Africa. Use filters for category, location, and price.
          </p>
        </div>

        {/* Step 2 */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-[#2E8B57] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-5">
            02
          </div>
          <h3 className="font-semibold text-xl mb-3 text-[#1E3A5F]">Chat on WhatsApp</h3>
          <p className="text-gray-600">
            Click “Chat on WhatsApp” to speak directly with the seller. Negotiate naturally — no complicated messaging system.
          </p>
        </div>

        {/* Step 3 */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-[#2E8B57] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-5">
            03
          </div>
          <h3 className="font-semibold text-xl mb-3 text-[#1E3A5F]">Complete the Deal</h3>
          <p className="text-gray-600">
            Pay directly or use our optional secure escrow service for higher-value items. Buyer confirms receipt before funds are released.
          </p>
        </div>
      </div>

      <div className="mt-16 bg-gray-50 border rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-3">Ready to get started?</h2>
        <p className="text-gray-600 mb-6">List your first item in under 2 minutes.</p>
        <a href="/sell" className="inline-block bg-[#2E8B57] text-white font-semibold px-8 py-3 rounded-xl">
          Start Selling Free
        </a>
      </div>
    </div>
  );
}