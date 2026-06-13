import { Suspense } from 'react';
import CheckoutContent from './CheckoutContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}