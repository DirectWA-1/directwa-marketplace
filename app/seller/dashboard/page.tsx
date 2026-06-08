'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async (userId: string) => {
    const { data: activeData } = await supabase
      .from('listings')
      .select('id, title, price, location, images, created_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (activeData) setActiveListings(activeData);

    const { data: soldData } = await supabase
      .from('listings')
      .select('id, title, price, location, images, created_at')
      .eq('user_id', userId)
      .eq('status', 'sold')
      .order('created_at', { ascending: false });

    if (soldData) setSoldListings(soldData);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      setUser(user);
      await fetchListings(user.id);

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
    : '0.0';

  // Mark as Sold
  const handleMarkAsSold = async (id: string) => {
    if (!confirm('Mark this listing as sold?')) return;

    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to mark as sold');
    } else {
      toast.success('Listing marked as sold');
      if (user) await fetchListings(user.id);
    }
  };

  // Reactivate sold listing
  const handleReactivate = async (id: string) => {
    if (!confirm('Reactivate this listing?')) return;

    const { error } = await supabase
      .from('listings')
      .update({ status: 'active' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to reactivate listing');
    } else {
      toast.success('Listing reactivated');
      if (user) await fetchListings(user.id);
    }
  };

  // Delete listing
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;

    const { error } = await supabase.from('listings').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete listing');
    } else {
      toast.success('Listing deleted');
      if (user) await fetchListings(user.id);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your store.</p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Link href="/seller/setup" className="px-5 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">
            Edit Public Profile
          </Link>
          <Link href="/sell" className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-6 py-3 rounded-xl font-semibold">
            + Create New Listing
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-6">Active Listings ({activeListings.length})</h2>

        {activeListings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center">
            <p className="text-gray-600 mb-4">You have no active listings.</p>
            <Link href="/sell" className="inline-block bg-[#2E8B57] text-white px-6 py-3 rounded-xl font-semibold">
              Create New Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeListings.map((listing) => {
              const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';

              return (
                <div key={listing.id} className="bg-white border rounded-2xl overflow-hidden group">
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
                      <Link href={`/sell?edit=${listing.id}`} className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
                        Edit
                      </Link>
                      <button onClick={() => handleMarkAsSold(listing.id)} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">
                        Mark as Sold
                      </button>
                      <button onClick={() => handleDelete(listing.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sold Listings with Reactivate */}
      <div>
        <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-6">Sold Listings ({soldListings.length})</h2>

        {soldListings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
            No sold listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {soldListings.map((listing) => {
              const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';

              return (
                <div key={listing.id} className="bg-white border rounded-2xl overflow-hidden opacity-90">
                  <Link href={`/listings/${listing.id}`}>
                    <img src={image} alt={listing.title} className="w-full h-48 object-cover" />
                  </Link>
                  <div className="p-5">
                    <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                    <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>

                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleReactivate(listing.id)} 
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"
                      >
                        Reactivate
                      </button>
                      <button onClick={() => handleDelete(listing.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}