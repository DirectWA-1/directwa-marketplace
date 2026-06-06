export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-8">Terms of Service</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600">Last updated: June 2026</p>

        <h2 className="mt-8">1. Acceptance of Terms</h2>
        <p>By accessing or using DirectWA, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>

        <h2 className="mt-8">2. Description of Service</h2>
        <p>DirectWA is a hybrid marketplace that connects buyers and sellers in South Africa. Users can browse listings on the web and communicate directly via WhatsApp. We also offer an optional escrow service for secure transactions.</p>

        <h2 className="mt-8">3. User Responsibilities</h2>
        <ul>
          <li>You must provide accurate information when creating listings.</li>
          <li>You are responsible for all communication and transactions conducted via WhatsApp.</li>
          <li>You must not post illegal, fraudulent, or misleading content.</li>
        </ul>

        <h2 className="mt-8">4. Escrow Service</h2>
        <p>Our optional escrow service is available for higher-value transactions. Funds are held securely until the buyer confirms receipt of the item. DirectWA acts as a neutral third party.</p>

        <h2 className="mt-8">5. Limitation of Liability</h2>
        <p>DirectWA is not responsible for the quality, safety, or legality of items listed, nor for any disputes between buyers and sellers outside of the escrow service.</p>

        <h2 className="mt-8">6. Changes to Terms</h2>
        <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>

        <p className="mt-10 text-sm text-gray-500">For any questions, please contact us through the platform.</p>
      </div>
    </div>
  );
}