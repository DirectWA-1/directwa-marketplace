'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface WishlistButtonProps {
  listingId: string;
}

export default function WishlistButton({ listingId }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .single();

      setIsWishlisted(!!data);
    };

    checkWishlist();
  }, [listingId]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setLoading(true);

    if (isWishlisted) {
      // Remove from wishlist
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (!error) {
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } else {
      // Add to wishlist
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          listing_id: listingId,
        });

      if (!error) {
        setIsWishlisted(true);
        toast.success('Added to wishlist', {
          description: 'You can view it in your wishlist',
          action: {
            label: 'View Wishlist',
            onClick: () => window.location.href = '/wishlist',
          },
        });
      } else {
        toast.error('Failed to add to wishlist');
      }
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
        }`}
      />
    </button>
  );
}