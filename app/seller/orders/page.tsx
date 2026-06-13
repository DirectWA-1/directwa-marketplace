'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  buyer_id: string;
}

interface Escrow {
  id: string;
  status: string;
  order_id: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [escrowMap, setEscrowMap] = useState<Record<string, Escrow>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'shipped' | 'delivered'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersData) {
      setOrders(ordersData);

      const orderIds = ordersData.map(o => o.id);
      const { data: escrowData } = await supabase
        .from('escrow_transactions')
        .select('*')
        .in('order_id', orderIds);

      if (escrowData) {
        const map: Record<string, Escrow> = {};
        escrowData.forEach(e => (map[e.order_id] = e));
        setEscrowMap(map);
      }
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) toast.error('Failed to update order');
    else {
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    }
    setUpdatingId(null);
  };

  const requestEscrowRelease = async (orderId: string) => {
    const escrow = escrowMap[orderId];
    if (!escrow) return;

    setUpdatingId(orderId);
    const { error } = await supabase.from('escrow_transactions').update({ status: 'release_requested' }).eq('id', escrow.id);
    if (error) toast.error('Failed to request release');
    else {
      toast.success('Escrow release requested');
      fetchOrders();
    }
    setUpdatingId(null);
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">All Received Orders</h1>
        <Link href="/seller/dashboard" className="text-[#2E8B57] hover:underline">← Back to Dashboard</Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'paid', 'shipped', 'delivered'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
              filter === f ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Orders' : f}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
          No orders found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const escrow = escrowMap[order.id];
            const canShip = order.status === 'paid';
            const canRequestRelease = order.status === 'shipped' && escrow?.status === 'held';

            return (
              <div key={order.id} className="bg-white border rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-2xl font-bold mt-1">R{(order.total_amount || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString()} • {order.payment_method || 'PayFast'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-sm rounded-full capitalize font-medium ${
                    order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'shipped' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                  }`}>
                    {order.status}
                  </span>

                  {canShip && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      disabled={updatingId === order.id}
                      className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-5 py-2 rounded-xl text-sm font-medium disabled:bg-gray-400"
                    >
                      Mark as Shipped
                    </button>
                  )}

                  {canRequestRelease && (
                    <button
                      onClick={() => requestEscrowRelease(order.id)}
                      disabled={updatingId === order.id}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-medium disabled:bg-gray-400"
                    >
                      Request Escrow Release
                    </button>
                  )}

                  {escrow?.status === 'release_requested' && (
                    <span className="text-purple-600 text-sm font-medium">Release Requested</span>
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