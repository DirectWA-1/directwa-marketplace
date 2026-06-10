'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SellerProfile {
  id: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
}

interface Review {
  rating: number;
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchSellerData = async () => {
      setLoading(true);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, bio, location, avatar_url, created_at')
        .eq('id', sellerId)
        .single();

      if (profileData) setProfile(profileData);

      const { data: listingsData } = await supabase
        .from('listings')
        .select('id, title, price, location, images')
        .eq('user_id', sellerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (listingsData) setListings(listingsData);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('seller_id', sellerId);

      if (reviewsData && reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
        setTotalReviews(reviewsData.length);
      }

      setLoading(false);
    };

    fetchSellerData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
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

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Seller Header with Avatar */}
      <div className="bg-white border rounded-3xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-4xl font-semibold">
                {profile.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#1E3A5F]">{profile.full_name}</h1>
            <p className="text-gray-500 mt-1">Member since {memberSince}</p>
            {profile.location && <p className="text-gray-500 mt-1">📍 {profile.location}</p>}

            {averageRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(averageRating))}</div>
                <span className="text-xl font-semibold">{averageRating}</span>
                <span className="text-gray-500">({totalReviews} reviews)</span>
              </div>
            )}
          </div>

          <a
            href={`https://wa.me/27712345678?text=Hi%20${encodeURIComponent(profile.full_name)},%20I%20saw%20your%20profile%20on%20DirectWA`}
            target="_blank"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 self-start md:self-center"
          >
            💬 Chat on WhatsApp
          </a>
        </div>

        {profile.bio && (
          <p className="mt-6 text-gray-700 max-w-3xl">{profile.bio}</p>
        )}
      </div>

      {/* Active Listings */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">
            Active Listings ({listings.length})
          </h2>
        </div>

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
    </div>
  );
}