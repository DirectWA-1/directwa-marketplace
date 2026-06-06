'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Status = 'not_started' | 'payment_held' | 'in_inspection' | 'completed' | 'disputed';

export default function EscrowFlow() {
  const params = useParams();
  const id = params.id as string;
  const [status, setStatus] = useState<Status>('not_started');
  const [showModal, setShowModal] = useState(false);

  const listing = { title: "iPhone 13 Pro", price: 9500 };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/listings/${id}`} className="text-sm text-gray-500 mb-6 inline-block">← Back</Link>
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-6">Secure Escrow</h1>

      <div className="bg-white border rounded-2xl p-6 mb-8">
        <div className="flex justify-between text-xl font-bold"><span>Total</span><span>R{listing.price}</span></div>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        {status === 'not_started' && <button onClick={() => setShowModal(true)} className="w-full bg-[#2E8B57] text-white py-4 rounded-xl font-semibold">Pay Securely via Escrow</button>}
        {status === 'payment_held' && <button onClick={() => setStatus('in_inspection')} className="w-full border py-3 rounded-xl">Start Inspection Period</button>}
        {status === 'in_inspection' && <div className="space-y-3"><button onClick={() => setStatus('completed')} className="w-full bg-[#2E8B57] text-white py-3 rounded-xl">Confirm Receipt</button><button onClick={() => setStatus('disputed')} className="w-full border py-3 rounded-xl text-red-600">Open Dispute</button></div>}
        {(status === 'completed' || status === 'disputed') && <div className="text-center py-8 text-2xl">{status === 'completed' ? '✅ Transaction Completed' : '⚠️ Dispute Opened'}</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-sm">
            <p className="mb-6">Pay R{listing.price} via secure escrow?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border py-3 rounded-xl">Cancel</button>
              <button onClick={() => { setStatus('payment_held'); setShowModal(false); }} className="flex-1 bg-[#2E8B57] text-white py-3 rounded-xl">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}