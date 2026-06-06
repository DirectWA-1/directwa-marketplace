'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  location: string;
}

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setListings(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('listings').update({ status: newStatus }).eq('id', id);
    setMessage('Status updated');
    const { data } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setListings(data);
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await supabase.from('listings').delete().eq('id', id);
    setListings(listings.filter(l => l.id !== id));
    setMessage('Listing deleted');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">My Listings</h1>
        <Link href="/sell" className="bg-[#2E8B57] text-white px-5 py-2.5 rounded-xl font-semibold">+ New Listing</Link>
      </div>

      {message && <p className="mb-4 text-[#2E8B57]">{message}</p>}

      {listings.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-gray-600 mb-6">No listings yet.</p>
          <Link href="/sell" className="bg-[#2E8B57] text-white px-6 py-3 rounded-xl">Create Listing</Link>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Item</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {listings.map((l) => (
                <tr key={l.id}>
                  <td className="p-4 font-medium">{l.title}</td>
                  <td className="p-4 font-semibold">R{l.price}</td>
                  <td className="p-4">
                    <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)} className="border rounded px-3 py-1">
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="expired">Expired</option>
                    </select>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Link href={`/listings/${l.id}`} className="text-xs px-3 py-1.5 border rounded">View</Link>
                    <button onClick={() => deleteListing(l.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}