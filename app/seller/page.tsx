'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  created_at: string;
}

interface SellerInfo {
  id: string;
  email: string;
}

export default function SellerProfile() {
  const params = useParams();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
    }
  }, [sellerId]);

  const fetchSellerData = async () => {
    setLoading(true);

    // Fetch seller info
    const { data: sellerData } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('id', sellerId)
      .single();

    if (sellerData) setSeller(sellerData);

    // Fetch seller's active listings
    const { data: listingsData } = await supabase
      .from('listings')
      .select('id, title, price, location, category, images, created_at')
      .eq('user_id', sellerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (listingsData) setListings(listingsData);

    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center">Loading seller profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to listings
        </Link>
        
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Seller Profile</h1>
          {seller && (
            <p className="text-gray-600 mt-1">{seller.email}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {listings.length} active listing{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <p className="text-gray-500">This seller has no active listings right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => {
            const displayImage = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';

            return (
              <Link 
                key={listing.id} 
                href={`/listings/${listing.id}`}
                className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative">
                  <img 
                    src={displayImage} 
                    alt={listing.title} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  {listing.category && (
                    <div className="absolute top-3 left-3 bg-white/90 text-[#1E3A5F] text-xs font-medium px-3 py-1 rounded-full">
                      {listing.category}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#2E8B57] transition-colors">
                    {listing.title}
                  </h3>

                  <div className="text-2xl font-bold text-[#1E3A5F] mb-3">
                    R{listing.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">📍 {listing.location}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}