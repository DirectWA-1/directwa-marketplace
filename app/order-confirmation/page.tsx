'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const method = searchParams.get('method'); // 'cod' or 'payfast'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6">
        <svg
          className="h-10 w-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-3">
        Order Placed Successfully!
      </h1>

      <p className="text-gray-600 mb-8">
        Thank you for your purchase. We've received your order and will process it shortly.
      </p>

      <div className="bg-white border rounded-2xl p-8 text-left mb-8">
        <h2 className="font-semibold text-lg mb-4">Order Details</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium">
              {method === 'cod' ? 'Cash on Delivery' : 'PayFast / Card'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="font-medium text-green-600">
              {method === 'cod' ? 'Pending Payment on Delivery' : 'Payment Received'}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t text-sm text-gray-600">
          {method === 'cod' ? (
            <p>
              Please have the exact amount ready when your order is delivered. 
              Our driver will contact you shortly.
            </p>
          ) : (
            <p>
              Your payment has been processed successfully. You will receive an email 
              confirmation shortly.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/listings"
          className="px-6 py-3 border border-[#2E8B57] text-[#2E8B57] rounded-2xl font-semibold hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-[#2E8B57] text-white rounded-2xl font-semibold hover:bg-[#246B46]"
        >
          Go to Homepage
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Need help? Contact us at{' '}
        <a href="mailto:support@directwa.co.za" className="text-[#2E8B57] hover:underline">
          support@directwa.co.za
        </a>
      </p>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading order details...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}