'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ReportModal from '@/app/components/ReportModal';

interface Seller {
  id: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  created_at: string;
}

export default function SellerProfile() {
  const params = useParams();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (sellerId) fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    setLoading(true);

    const { data: sellerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sellerId)
      .single();

    if (sellerData) setSeller(sellerData);

    const { data: listingsData } = await supabase
      .from('listings')
      .select('id, title, price, images, created_at')
      .eq('user_id', sellerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (listingsData) setListings(listingsData);
    setLoading(false);
  };

  // ==================== SKELETON LOADER ====================
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Seller Header Skeleton */}
        <div className="bg-white border rounded-2xl p-8 mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-2/3 bg-gray-200 rounded" />
              <div className="h-5 w-1/3 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Listings Skeleton */}
        <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-7 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!seller) return <div className="p-8 text-center">Seller not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Back to listings
      </Link>

      {/* Seller Header */}
      <div className="bg-white border rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-3xl font-bold">
                {seller.full_name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-[#1E3A5F]">{seller.full_name}</h1>
                {seller.location && <p className="text-gray-600 mt-1">📍 {seller.location}</p>}
              </div>

              {/* Report Seller Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                🚩 Report Seller
              </button>
            </div>

            {seller.bio && <p className="mt-4 text-gray-700 leading-relaxed">{seller.bio}</p>}
          </div>
        </div>
      </div>

      {/* Seller's Listings */}
      <div>
        <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-6">
          Active Listings ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
            This seller has no active listings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => {
              const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';

              return (
                <Link 
                  key={listing.id} 
                  href={`/listings/${listing.id}`}
                  className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <img 
                    src={image} 
                    alt={listing.title} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="p-5">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-[#2E8B57]">{listing.title}</h3>
                    <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && seller && (
        <ReportModal
          targetType="user"
          targetId={seller.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}