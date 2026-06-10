import Link from 'next/link';

export default function OrderConfirmation() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-4">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-8">Thank you for your purchase. The seller will contact you shortly via WhatsApp.</p>
      
      <Link href="/listings" className="bg-[#2E8B57] text-white px-8 py-3 rounded-2xl font-semibold">
        Continue Shopping
      </Link>
    </div>
  );
}