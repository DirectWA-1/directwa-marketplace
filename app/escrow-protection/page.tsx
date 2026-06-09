export default function EscrowProtectionPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-[#1E3A5F] mb-6">Escrow Protection</h1>
      
      <div className="prose prose-lg">
        <p>
          We recommend using escrow for transactions above R2,000 or when buying/selling high-value or used items.
        </p>
        
        <h2 className="mt-8">How Escrow Works on DirectWA</h2>
        <ol>
          <li>Buyer pays into our secure escrow account.</li>
          <li>Seller ships or hands over the item.</li>
          <li>Buyer confirms receipt and satisfaction.</li>
          <li>Funds are released to the seller.</li>
        </ol>

        <p className="mt-6">
          This protects both buyers and sellers from fraud and misunderstandings.
        </p>
      </div>
    </div>
  );
}