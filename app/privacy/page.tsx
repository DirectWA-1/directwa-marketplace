export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600">Last updated: June 2026</p>

        <h2 className="mt-8">1. Information We Collect</h2>
        <p>We collect the following information:</p>
        <ul>
          <li>Phone number and email (for authentication)</li>
          <li>Listing details you create</li>
          <li>Usage data (via Vercel Analytics)</li>
        </ul>

        <h2 className="mt-8">2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve the platform</li>
          <li>Enable communication between buyers and sellers</li>
          <li>Process escrow transactions securely</li>
          <li>Prevent fraud and abuse</li>
        </ul>

        <h2 className="mt-8">3. Data Sharing</h2>
        <p>We do not sell your personal data. We only share information when necessary to provide the service (e.g., with payment providers for escrow).</p>

        <h2 className="mt-8">4. Data Security</h2>
        <p>We use industry-standard security practices. However, no system is 100% secure. We recommend using strong passwords and being cautious when sharing information on WhatsApp.</p>

        <h2 className="mt-8">5. Your Rights</h2>
        <p>You may request deletion of your account and data at any time by contacting us.</p>

        <p className="mt-10 text-sm text-gray-500">If you have any privacy concerns, please reach out through the platform.</p>
      </div>
    </div>
  );
}