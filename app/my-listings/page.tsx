'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, location, images, created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load your listings');
      } else if (data) {
        setListings(data);
      }
      setLoading(false);
    };

    fetchMyListings();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { error } = await supabase.from('listings').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete listing');
    } else {
      setListings(prev => prev.filter(listing => listing.id !== id));
      toast.success('Listing deleted');
    }
  };

  const handleMarkAsSold = async (id: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to mark as sold');
    } else {
      setListings(prev => prev.filter(listing => listing.id !== id));
      toast.success('Listing marked as sold');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 w-44 bg-gray-200 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-7 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">My Listings ({listings.length})</h1>
        <Link href="/create-listing" className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-6 py-3 rounded-xl font-semibold">
          + Create New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">
          <p className="text-gray-600 mb-4">You don't have any active listings yet.</p>
          <Link href="/create-listing" className="inline-block bg-[#2E8B57] text-white px-6 py-3 rounded-xl font-semibold">
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => {
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
                    <Link 
                      href={`/create-listing?edit=${listing.id}`} 
                      className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleMarkAsSold(listing.id)} 
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm"
                    >
                      Mark Sold
                    </button>
                    <button 
                      onClick={() => handleDelete(listing.id)} 
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm"
                    >
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
  );
}