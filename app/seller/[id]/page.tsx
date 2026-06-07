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

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function SellerProfile() {
  const params = useParams();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sellerId) fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    setLoading(true);

    const { data: sellerData } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('id', sellerId)
      .single();

    if (sellerData) setSeller(sellerData);

    const { data: listingsData } = await supabase
      .from('listings')
      .select('id, title, price, location, category, images, created_at')
      .eq('user_id', sellerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (listingsData) setListings(listingsData);

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (reviewsData && reviewsData.length > 0) {
      setReviews(reviewsData);
      const total = reviewsData.reduce((sum, r) => sum + r.rating, 0);
      setAverageRating(Math.round((total / reviewsData.length) * 10) / 10);
      setTotalReviews(reviewsData.length);
    }

    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center">Loading seller profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700">← Back to listings</Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">Seller Profile</h1>
        {seller && <p className="text-gray-600 mt-1">{seller.email}</p>}

        {totalReviews > 0 ? (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(averageRating))}</span>
            <span className="text-2xl font-bold">{averageRating}</span>
            <span className="text-gray-500">({totalReviews} reviews)</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No reviews yet</p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-6">Active Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="text-gray-500">No active listings.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`} className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg">
                <img src={listing.images?.[0] || 'https://picsum.photos/id/20/400/300'} alt="" className="w-full h-48 object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="text-2xl font-bold text-[#1E3A5F] mt-2">R{listing.price}</p>
                  <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Reviews Received</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && <p>{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 