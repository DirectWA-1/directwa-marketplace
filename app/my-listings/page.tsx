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
  category: string;
}

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) setListings(data);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setMessage('Status updated successfully');
      // Refresh listings
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setListings(data);
    } else {
      setMessage('Error updating status');
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { error } = await supabase.from('listings').delete().eq('id', id);

    if (!error) {
      setListings(listings.filter(l => l.id !== id));
      setMessage('Listing deleted');
    } else {
      setMessage('Error deleting listing');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your listings...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in</h2>
        <Link href="/login" className="bg-[#1E3A5F] text-white px-6 py-3 rounded-xl inline-block">
          Log in to view your listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">My Listings</h1>
          <p className="text-gray-600">Manage your active and sold items</p>
        </div>
        <Link href="/sell" className="bg-[#2E8B57] text-white px-5 py-2.5 rounded-xl font-semibold">
          + Create New Listing
        </Link>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {message}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-gray-600 mb-6">You haven't created any listings yet.</p>
          <Link href="/sell" className="bg-[#2E8B57] text-white px-6 py-3 rounded-xl inline-block">
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Item</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{listing.title}</td>
                  <td className="p-4 font-semibold">R{listing.price}</td>
                  <td className="p-4 text-gray-600">{listing.location}</td>
                  <td className="p-4">
                    <select 
                      value={listing.status} 
                      onChange={(e) => updateStatus(listing.id, e.target.value)}
                      className="border rounded-lg px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="expired">Expired</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link 
                        href={`/listings/${listing.id}`} 
                        className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-100"
                      >
                        View
                      </Link>
                      <button 
                        onClick={() => deleteListing(listing.id)} 
                        className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
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