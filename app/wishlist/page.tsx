'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import WishlistButton from '@/app/components/WishlistButton';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
}

export default function WishlistPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Get wishlist items
      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('listing_id')
        .eq('user_id', user.id);

      if (!wishlistData || wishlistData.length === 0) {
        setLoading(false);
        return;
      }

      const listingIds = wishlistData.map(w => w.listing_id);

      // Get the actual listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('id, title, price, location, images')
        .in('id', listingIds);

      if (listingsData) {
        setListings(listingsData);
      }
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (listingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) {
      toast.error('Failed to remove from wishlist');
    } else {
      setListings(prev => prev.filter(item => item.id !== listingId));
      toast.success('Removed from wishlist');
    }
  };

  // ==================== SKELETON LOADER ====================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-9 w-48 bg-gray-200 rounded mb-8 animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-7 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1E3A5F] mb-4">Your Wishlist is Empty</h1>
        <p className="text-gray-600 mb-8">You haven't saved any items yet.</p>
        <Link href="/listings" className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-xl font-semibold">
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">My Wishlist ({listings.length} items)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => {
          const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';

          return (
            <div key={listing.id} className="bg-white border rounded-2xl overflow-hidden group relative">
              {/* Wishlist Button */}
              <div className="absolute top-3 right-3 z-10">
                <button onClick={() => removeFromWishlist(listing.id)} className="text-red-500 hover:text-red-600">
                  <WishlistButton listingId={listing.id} />
                </button>
              </div>

              <Link href={`/listings/${listing.id}`}>
                <img src={image} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
              </Link>

              <div className="p-5">
                <Link href={`/listings/${listing.id}`}>
                  <h3 className="font-semibold line-clamp-2 hover:text-[#2E8B57]">{listing.title}</h3>
                </Link>
                <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}