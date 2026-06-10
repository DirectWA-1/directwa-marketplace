'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  created_at: string;
}

interface Review {
  rating: number;
}

export default function SellerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      setUser(user);

      // Fetch profile (name + avatar)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || '');
        setUserAvatar(profile.avatar_url || '');
      }

      // Active listings
      const { data: activeData } = await supabase
        .from('listings')
        .select('id, title, price, location, images, created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (activeData) setActiveListings(activeData);

      // Sold listings
      const { data: soldData } = await supabase
        .from('listings')
        .select('id, title, price, location, images, created_at')
        .eq('user_id', user.id)
        .eq('status', 'sold')
        .order('created_at', { ascending: false });

      if (soldData) setSoldListings(soldData);

      // Reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('seller_id', user.id);

      if (reviewsData) setReviews(reviewsData);

      setLoading(false);
    };

    fetchData();
  }, []);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
          {userAvatar ? (
            <img src={userAvatar} alt="Your avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-2xl font-semibold">
              {userName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Welcome back, {userName?.split(' ')[0]}!</h1>
          <p className="text-gray-600">Here's an overview of your store.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Active Listings</p>
          <p className="text-4xl font-bold text-[#1E3A5F] mt-2">{activeListings.length}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Sold Listings</p>
          <p className="text-4xl font-bold text-[#1E3A5F] mt-2">{soldListings.length}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="text-4xl font-bold text-[#1E3A5F] mt-2">{reviews.length}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-4xl font-bold text-[#1E3A5F] mt-2">{averageRating}</p>
        </div>
      </div>

      {/* Active Listings */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Active Listings</h2>
          <Link href="/create-listing" className="bg-[#2E8B57] text-white px-4 py-2 rounded-xl text-sm font-medium">
            + Create New Listing
          </Link>
        </div>

        {activeListings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
            You have no active listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeListings.map((listing) => {
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

      {/* Sold Listings */}
      {soldListings.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-6">Sold Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {soldListings.map((listing) => {
              const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';
              return (
                <div key={listing.id} className="bg-white border rounded-2xl overflow-hidden opacity-90">
                  <img src={image} alt={listing.title} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                    <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>
                    <div className="mt-3 text-sm text-green-600 font-medium">✓ Sold</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}