export default function EscrowProtection() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-8">Escrow Protection</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-600">Our optional escrow service helps make higher-value transactions safer for both buyers and sellers.</p>

        <h2 className="mt-8">How It Works</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Buyer pays into escrow via our secure payment partner.</li>
          <li>Seller ships or hands over the item.</li>
          <li>Buyer has an inspection period to verify the item.</li>
          <li>Once the buyer confirms receipt and satisfaction, funds are released to the seller.</li>
          <li>If there is a dispute, our team reviews and mediates.</li>
        </ol>

        <h2 className="mt-8">Benefits</h2>
        <ul>
          <li>Buyer is protected if the item is not as described.</li>
          <li>Seller is protected against non-payment.</li>
          <li>Both parties have a neutral third party in case of disagreement.</li>
        </ul>

        <h2 className="mt-8">When to Use Escrow</h2>
        <p>We recommend using escrow for transactions above R2,000 or when buying/selling high-value or used items.</p>

        <p className="mt-10 text-sm text-gray-500">Escrow is currently in beta. More payment methods will be added soon.</p>
      </div>
    </div>
  );
}