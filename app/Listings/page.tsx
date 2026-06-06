'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase.from('listings').select('*').eq('status', 'active').order('created_at', { ascending: false });
      if (data) setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const openWhatsApp = (listing: Listing) => {
    const message = encodeURIComponent(`Hi, I'm interested in your "${listing.title}" on DirectWA.`);
    window.open(`https://wa.me/27721234567?text=${message}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center">Loading listings...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1E3A5F]">Browse Listings</h1>
          <p className="text-gray-600">Discover great deals</p>
        </div>
        <Link href="/sell" className="bg-[#2E8B57] text-white px-5 py-2.5 rounded-xl font-semibold">+ Sell Item</Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">No listings yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-2xl border overflow-hidden">
              <img src={listing.images?.[0] || 'https://picsum.photos/id/20/400/300'} alt="" className="w-full h-48 object-cover" />
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                <div className="text-2xl font-bold text-[#1E3A5F] mb-3">R{listing.price}</div>
                <div className="text-sm text-gray-500 mb-4">{listing.location}</div>
                <div className="flex gap-2">
                  <button onClick={() => openWhatsApp(listing)} className="flex-1 bg-[#25D366] text-white font-semibold py-3 rounded-xl text-sm">Chat on WhatsApp</button>
                  <Link href={`/listings/${listing.id}`} className="px-4 py-3 border rounded-xl text-sm">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}