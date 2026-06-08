'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  listing_id: string;
  created_at: string;
  listings: {
    id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
  };
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          listing_id,
          created_at,
          listings (
            id,
            title,
            price,
            location,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load wishlist');
      } else if (data) {
        setWishlist(data as any);
      }

      setLoading(false);
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (wishlistId: string) => {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId);

    if (error) {
      toast.error('Failed to remove from wishlist');
    } else {
      setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      toast.success('Removed from wishlist');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading wishlist...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-8">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start saving items you like!</p>
          <Link href="/listings" className="inline-block bg-[#2E8B57] text-white px-8 py-3 rounded-xl font-semibold">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const listing = item.listings;
            const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';

            return (
              <div key={item.id} className="bg-white border rounded-2xl overflow-hidden group">
                <Link href={`/listings/${listing.id}`}>
                  <img src={image} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                </Link>
                
                <div className="p-5">
                  <Link href={`/listings/${listing.id}`}>
                    <h3 className="font-semibold line-clamp-2 hover:text-[#2E8B57]">{listing.title}</h3>
                  </Link>
                  <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>

                  <div className="flex gap-2 mt-4">
                    <Link 
                      href={`/listings/${listing.id}`} 
                      className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm"
                    >
                      Remove
                    </button>
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