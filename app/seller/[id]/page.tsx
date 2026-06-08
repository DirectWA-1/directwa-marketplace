'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ReportModal from '@/app/components/ReportModal';

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

  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (sellerId) {
      fetchSellerData();
    }
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
      const avg = total / reviewsData.length;
      setAverageRating(Math.round(avg * 10) / 10);
      setTotalReviews(reviewsData.length);
    }

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

        <div className="mt-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A5F]">Seller Profile</h1>
            {seller && <p className="text-gray-600 mt-1">{seller.email}</p>}

            {totalReviews > 0 ? (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(averageRating))}</span>
                  <span className="text-2xl font-bold ml-1 text-[#1E3A5F]">{averageRating}</span>
                </div>
                <span className="text-gray-500">({totalReviews} review{totalReviews > 1 ? 's' : ''})</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No reviews yet</p>
            )}
          </div>

          {/* Report Seller Button */}
          <button 
            onClick={() => setShowReportModal(true)}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 mt-1"
          >
            🚩 Report Seller
          </button>
        </div>
      </div>

      {/* Active Listings */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-[#1E3A5F] mb-6">Active Listings ({listings.length})</h2>

        {listings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🛍️</span>
            </div>
            <h3 className="text-xl font-semibold text-[#1E3A5F] mb-2">No active listings yet</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              This seller hasn't listed any items for sale at the moment.
            </p>
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
                    <div className="text-2xl font-bold text-[#1E3A5F] mb-2">
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

      {/* Reviews Received */}
      <div>
        <h2 className="text-xl font-semibold text-[#1E3A5F] mb-6">Reviews Received</h2>

        {reviews.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="text-xl font-semibold text-[#1E3A5F] mb-2">No reviews yet</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              This seller hasn't received any reviews yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="user"
        targetId={sellerId}
        targetName={seller?.email}
      />
    </div>
  );
}