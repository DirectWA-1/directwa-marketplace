'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface Purchase {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  items?: any[]; // For thumbnail support
}

interface Escrow {
  id: string;
  status: string;
  order_id: string;
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [escrowMap, setEscrowMap] = useState<Record<string, Escrow>>({});
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (orders) {
      setPurchases(orders);

      const orderIds = orders.map(o => o.id);
      const { data: escrows } = await supabase
        .from('escrow_transactions')
        .select('*')
        .in('order_id', orderIds);

      if (escrows) {
        const map: Record<string, Escrow> = {};
        escrows.forEach(e => map[e.order_id] = e);
        setEscrowMap(map);
      }
    }
    setLoading(false);
  };

  const confirmDelivery = async (orderId: string) => {
    const escrow = escrowMap[orderId];
    if (!escrow) return toast.error('Escrow record not found');

    setConfirmingId(orderId);

    try {
      await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
      await supabase.from('escrow_transactions').update({ status: 'released' }).eq('id', escrow.id);

      toast.success('Delivery confirmed! Escrow released.');
      fetchPurchases();
    } catch (error) {
      toast.error('Failed to confirm delivery');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your purchases...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">My Purchases</h1>

      {purchases.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-gray-500">You haven't made any purchases yet.</p>
          <Link href="/listings" className="mt-6 inline-block text-[#2E8B57] hover:underline">Browse listings →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => {
            const escrow = escrowMap[purchase.id];
            const canConfirm = purchase.status === 'shipped' && escrow?.status === 'held';

            return (
              <div key={purchase.id} className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                    {/* Add thumbnail logic if you have item images in orders */}
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      📦
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-sm text-gray-500">Order #{purchase.id.slice(0,8)}</p>
                        <p className="text-2xl font-bold mt-1">R{(purchase.total_amount || 0).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        {purchase.status === 'paid' && <span className="px-4 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Paid</span>}
                        {purchase.status === 'shipped' && <span className="px-4 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">Shipped</span>}
                        {purchase.status === 'delivered' && <span className="px-4 py-1 bg-green-100 text-green-700 text-sm rounded-full">Delivered</span>}
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(purchase.created_at).toLocaleDateString()} • {purchase.payment_method || 'PayFast'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 md:w-48">
                    <Link href={`/orders/${purchase.id}`} className="text-center border py-2.5 rounded-2xl text-sm hover:bg-gray-50">
                      View Order
                    </Link>
                    
                    {canConfirm && (
                      <button
                        onClick={() => confirmDelivery(purchase.id)}
                        disabled={confirmingId === purchase.id}
                        className="bg-[#2E8B57] hover:bg-[#246B46] text-white py-2.5 rounded-2xl text-sm font-medium disabled:bg-gray-400"
                      >
                        {confirmingId === purchase.id ? 'Confirming...' : 'Confirm Received'}
                      </button>
                    )}

                    <Link href={`/chat/${purchase.id}`} className="text-center border py-2.5 rounded-2xl text-sm hover:bg-gray-50">
                      Message Seller
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}