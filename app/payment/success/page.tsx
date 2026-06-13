export default function PaymentSuccess() {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">Thank you. Your order has been placed.</p>
      <a href="/listings" className="text-[#2E8B57] hover:underline">
        Browse more listings →
      </a>
    </div>
  );
}