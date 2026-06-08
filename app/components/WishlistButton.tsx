'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistButtonProps {
  listingId: string;
  className?: string;
}

export default function WishlistButton({ listingId, className = '' }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const checkWishlistStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsInWishlist(false);
      setUserId(null);
      return;
    }
    setUserId(user.id);

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .single();

    setIsInWishlist(!!data);
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [listingId]);

  const toggleWishlist = async () => {
    if (!userId) {
      toast.error('Please log in to save items');
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        await supabase.from('wishlists').delete().eq('user_id', userId).eq('listing_id', listingId);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase.from('wishlists').insert({ user_id: userId, listing_id: listingId });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 ${className} ${
        isInWishlist 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-600'
      }`}
    >
      <Heart className={`w-5 h-5 transition-all ${isInWishlist ? 'fill-current scale-110' : ''}`} />
    </button>
  );
}