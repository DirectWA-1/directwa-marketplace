'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import WishlistButton from '@/app/components/WishlistButton';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  images: string[];
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, location, category, images')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (data) {
        setListings(data);
        setFilteredListings(data);
      }
      setLoading(false);
    };

    fetchListings();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredListings(listings);
    } else {
      const filtered = listings.filter((listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredListings(filtered);
    }
  }, [searchTerm, listings]);

  if (loading) return <div className="p-8 text-center">Loading listings...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Browse Listings</h1>
        
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2E8B57]"
          />
          <Link href="/sell" className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap">
            Sell an Item
          </Link>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-gray-600">No listings found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => {
            const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';

            return (
              <div key={listing.id} className="bg-white border rounded-2xl overflow-hidden group relative">
                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-10">
                  <WishlistButton listingId={listing.id} />
                </div>

                <Link href={`/listings/${listing.id}`}>
                  <img 
                    src={image} 
                    alt={listing.title} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform" 
                  />
                </Link>

                <div className="p-5">
                  <Link href={`/listings/${listing.id}`}>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-[#2E8B57]">{listing.title}</h3>
                  </Link>
                  <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}