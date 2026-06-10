'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  bank_reference: string | null;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Get total earnings
      const { data: soldListings } = await supabase
        .from('listings')
        .select('price')
        .eq('user_id', user.id)
        .eq('status', 'sold');

      const earned = soldListings?.reduce((sum, item) => sum + item.price, 0) || 0;
      setTotalEarned(earned);

      // Get withdrawals
      const { data: withdrawalData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('seller_id', user.id)
        .order('requested_at', { ascending: false });

      if (withdrawalData) setWithdrawals(withdrawalData);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > totalEarned) {
      toast.error('Amount exceeds available balance');
      return;
    }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('withdrawals').insert({
      seller_id: user.id,
      amount: withdrawAmount,
      bank_reference: bankReference || null,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to request withdrawal');
    } else {
      toast.success('Withdrawal request submitted successfully!');
      setAmount('');
      setBankReference('');
      
      // Refresh list
      const { data: newWithdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('seller_id', user.id)
        .order('requested_at', { ascending: false });

      if (newWithdrawals) setWithdrawals(newWithdrawals);
    }

    setSubmitting(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const availableBalance = totalEarned - withdrawals
    .filter(w => w.status === 'paid')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/seller/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold text-[#1E3A5F] mt-2">Withdraw Funds</h1>
      </div>

      {/* Balance Summary */}
      <div className="bg-white border rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Earned</p>
            <p className="text-3xl font-bold text-[#1E3A5F]">R{totalEarned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-3xl font-bold text-green-600">R{availableBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Withdrawals</p>
            <p className="text-3xl font-bold text-orange-600">
              R{withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-white border rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Request a Withdrawal</h2>
        
        <form onSubmit={handleWithdraw} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (R)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-2xl px-5 py-3 text-lg"
              placeholder="5000"
              min="1"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bank Reference / Account Number (Optional)</label>
            <input
              type="text"
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
              className="w-full border rounded-2xl px-5 py-3"
              placeholder="FNB - 1234567890"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#2E8B57] hover:bg-[#246B46] text-white py-4 rounded-2xl font-semibold text-lg disabled:bg-gray-400"
          >
            {submitting ? 'Submitting Request...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
        
        {withdrawals.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
            No withdrawal requests yet.
          </div>
        ) : (
          <div className="bg-white border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Reference</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-t">
                    <td className="p-4 text-sm">
                      {new Date(withdrawal.requested_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-semibold">R{withdrawal.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === 'paid' ? 'bg-green-100 text-green-700' :
                        withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {withdrawal.bank_reference || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}