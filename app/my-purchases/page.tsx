'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

interface Purchase {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
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
        escrows.forEach(e => (map[e.order_id] = e));
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

      toast.success('Delivery confirmed! Escrow released to seller.');
      fetchPurchases();
    } catch (error) {
      toast.error('Failed to confirm delivery');
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-blue-100 text-blue-700',
      shipped: 'bg-amber-100 text-amber-700',
      delivered: 'bg-green-100 text-green-700',
      pending: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading your purchases...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">My Purchases</h1>

      {purchases.length === 0 ? (
        <div className="bg-white border rounded-2xl p-8 text-center">
          You haven't made any purchases yet.
          <div className="mt-4">
            <Link href="/listings" className="text-[#2E8B57] hover:underline">Browse listings →</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const escrow = escrowMap[purchase.id];
            const canConfirm = purchase.status === 'shipped' && escrow?.status === 'held';

            return (
              <div key={purchase.id} className="bg-white border rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">Order #{purchase.id.slice(0, 8)}</p>
                  <p className="text-2xl font-bold mt-1">R{(purchase.total_amount || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(purchase.created_at).toLocaleDateString()} • {purchase.payment_method}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(purchase.status)}

                  {canConfirm && (
                    <button
                      onClick={() => confirmDelivery(purchase.id)}
                      disabled={confirmingId === purchase.id}
                      className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-6 py-2 rounded-xl text-sm font-medium disabled:bg-gray-400"
                    >
                      {confirmingId === purchase.id ? 'Confirming...' : 'Confirm Delivery'}
                    </button>
                  )}

                  {escrow?.status === 'released' && (
                    <span className="text-green-600 text-sm font-medium">Escrow Released ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}