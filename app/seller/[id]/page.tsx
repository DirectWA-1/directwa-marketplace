'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SellerProfile {
  id: string;
  full_name: string;
  created_at?: string;
  bio?: string;
  location?: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchSellerData = async () => {
      setLoading(true);

      // Fetch seller profile (including created_at if it exists)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, created_at, bio, location')
        .eq('id', sellerId)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch active listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('id, title, price, location, images')
        .eq('user_id', sellerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsData) setListings(listingsData);

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
        if (reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      }

      setLoading(false);
    };

    fetchSellerData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-8 w-64 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Seller not found</h1>
        <Link href="/listings" className="text-[#2E8B57] hover:underline mt-4 inline-block">
          Browse all listings
        </Link>
      </div>
    );
  }

  // Only show join date if created_at exists
  const memberSince = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-ZA', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Seller Header */}
      <div className="bg-white border rounded-3xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#1E3A5F]">{profile.full_name}</h1>
            
            {memberSince && (
              <p className="text-gray-500 mt-1">Member since {memberSince}</p>
            )}

            {profile.location && (
              <p className="text-gray-500 mt-1">📍 {profile.location}</p>
            )}

            {profile.bio && (
              <p className="text-gray-600 mt-3 max-w-md">{profile.bio}</p>
            )}

            {averageRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(averageRating))}</div>
                <span className="text-xl font-semibold">{averageRating}</span>
                <span className="text-gray-500">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          <a
            href={`https://wa.me/27712345678?text=Hi%20${encodeURIComponent(profile.full_name)},%20I%20saw%20your%20listings%20on%20DirectWA`}
            target="_blank"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Active Listings */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-6">
          Active Listings ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
            This seller currently has no active listings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => {
              const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';
              return (
                <Link href={`/listings/${listing.id}`} key={listing.id}>
                  <div className="bg-white border rounded-2xl overflow-hidden group hover:shadow-md transition">
                    <img src={image} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-5">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-[#2E8B57]">{listing.title}</h3>
                      <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-6">Reviews ({reviews.length})</h2>

        {reviews.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
            This seller hasn't received any reviews yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-yellow-500 text-xl">{'★'.repeat(review.rating)}</div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('en-ZA')}
                  </span>
                </div>
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}