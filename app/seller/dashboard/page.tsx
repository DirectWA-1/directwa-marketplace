'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';
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
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Avatar modal states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      setUser(user);

      // Fetch profile
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

  // ==================== CALCULATED STATS ====================
  const totalRevenue = soldListings.reduce((sum, listing) => sum + listing.price, 0);
  const totalSales = soldListings.length;
  const averageSaleValue = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  // ==================== AVATAR HANDLERS ====================
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      setNewAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!newAvatarFile || !user) return;

    setUploadingAvatar(true);

    try {
      const fileExt = newAvatarFile.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, newAvatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUserAvatar(publicUrl);
      setShowAvatarModal(false);
      setNewAvatarFile(null);
      setNewAvatarPreview('');

      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
              {userAvatar ? (
                <img src={userAvatar} alt="Your avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-2xl font-semibold">
                  {userName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1.5 shadow-sm hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-[#1E3A5F]">Welcome back, {userName?.split(' ')[0]}!</h1>
            <p className="text-gray-600">Here's how your store is performing.</p>
          </div>
        </div>

        <Link 
          href="/seller/edit-profile" 
          className="bg-white border border-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          Edit Profile
        </Link>
      </div>

      {/* ==================== EARNINGS OVERVIEW ==================== */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-[#1E3A5F] mb-4">Earnings Overview</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-4xl font-bold text-[#1E3A5F] mt-2">R{totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-4xl font-bold text-[#1E3A5F] mt-2">{totalSales}</p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">Avg. Sale Value</p>
            <p className="text-4xl font-bold text-[#1E3A5F] mt-2">R{averageSaleValue.toLocaleString()}</p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <p className="text-sm text-gray-500">Average Rating</p>
            <p className="text-4xl font-bold text-[#1E3A5F] mt-2">{averageRating}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
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
          <p className="text-sm text-gray-500">This Month's Sales</p>
          <p className="text-4xl font-bold text-[#1E3A5F] mt-2">
            {soldListings.filter(l => new Date(l.created_at).getMonth() === new Date().getMonth()).length}
          </p>
        </div>
      </div>

      {/* ==================== AVAILABLE BALANCE + WITHDRAW ==================== */}
      <div className="bg-white border rounded-2xl p-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-4xl font-bold text-green-600 mt-1">R{totalRevenue.toLocaleString()}</p>
          </div>
          <Link 
            href="/seller/withdrawals" 
            className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-2xl font-semibold text-center"
          >
            Withdraw Funds
          </Link>
        </div>
      </div>

      {/* Active Listings */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Active Listings ({activeListings.length})</h2>
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
          <h2 className="text-2xl font-semibold text-[#1E3A5F] mb-6">Recent Sales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {soldListings.slice(0, 8).map((listing) => {
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

      {/* Avatar Edit Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-6">Update Profile Picture</h3>
            
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-300 mb-6">
                {newAvatarPreview ? (
                  <img src={newAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : userAvatar ? (
                  <img src={userAvatar} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-4xl font-semibold">
                    {userName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <label className="cursor-pointer bg-white border border-gray-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 mb-4">
                Choose New Photo
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowAvatarModal(false)} 
                  className="flex-1 border border-gray-300 py-3 rounded-2xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAvatarUpload} 
                  disabled={!newAvatarFile || uploadingAvatar}
                  className="flex-1 bg-[#2E8B57] text-white py-3 rounded-2xl font-medium disabled:bg-gray-400"
                >
                  {uploadingAvatar ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}