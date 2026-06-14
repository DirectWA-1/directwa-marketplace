'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Edit, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  created_at: string;
  status: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  buyer_id: string;
  payment_method: string;
}

interface Escrow {
  id: string;
  amount: number;
  status: string;
  order_id: string;
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
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [escrowMap, setEscrowMap] = useState<Record<string, Escrow>>({});
  
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingListingId, setUpdatingListingId] = useState<string | null>(null);

  // Avatar Modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setUser(user);

    // Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserName(profile.full_name || '');
      setUserAvatar(profile.avatar_url || '');
    }

    // Active Listings
    const { data: activeData } = await supabase
      .from('listings')
      .select('id, title, price, location, images, created_at, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (activeData) setActiveListings(activeData);

    // Sold Listings
    const { data: soldData } = await supabase
      .from('listings')
      .select('id, title, price, location, images, created_at, status')
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

    // Received Orders + Escrow
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersData) {
      setReceivedOrders(ordersData);
      const orderIds = ordersData.map(o => o.id);
      const { data: escrowData } = await supabase
        .from('escrow_transactions')
        .select('*')
        .in('order_id', orderIds);
      if (escrowData) {
        const map: Record<string, Escrow> = {};
        escrowData.forEach(e => (map[e.order_id] = e));
        setEscrowMap(map);
      }
    }

    setLoading(false);
  };

  // ==================== LISTING ACTIONS ====================
  const markAsSold = async (listingId: string) => {
    setUpdatingListingId(listingId);
    const { error } = await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId).eq('user_id', user.id);
    if (error) toast.error('Failed to mark as sold');
    else {
      toast.success('Listing marked as sold!');
      fetchData();
    }
    setUpdatingListingId(null);
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setUpdatingListingId(listingId);
    const { error } = await supabase.from('listings').delete().eq('id', listingId).eq('user_id', user.id);
    if (error) toast.error('Failed to delete listing');
    else {
      toast.success('Listing deleted');
      fetchData();
    }
    setUpdatingListingId(null);
  };

  // ==================== ORDER ACTIONS ====================
  const markAsShipped = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    const { error } = await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId);
    if (error) toast.error('Failed to update');
    else {
      toast.success('Marked as shipped!');
      fetchData();
    }
    setUpdatingOrderId(null);
  };

  const requestEscrowRelease = async (orderId: string) => {
    const escrow = escrowMap[orderId];
    if (!escrow) return;
    setUpdatingOrderId(orderId);
    const { error } = await supabase.from('escrow_transactions').update({ status: 'release_requested' }).eq('id', escrow.id);
    if (error) toast.error('Failed to request release');
    else {
      toast.success('Release requested!');
      fetchData();
    }
    setUpdatingOrderId(null);
  };

  // Avatar handlers
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
      await supabase.storage.from('avatars').upload(fileName, newAvatarFile, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      setUserAvatar(publicUrl);
      setShowAvatarModal(false);
      setNewAvatarFile(null);
      setNewAvatarPreview('');
      toast.success('Profile picture updated!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  // Stats
  const totalRevenue = soldListings.reduce((sum, l) => sum + l.price, 0);
  const pendingEscrow = Object.values(escrowMap)
    .filter(e => e.status === 'held')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border">
              {userAvatar ? (
                <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-2xl font-semibold">
                  {userName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button onClick={() => setShowAvatarModal(true)} className="absolute -bottom-1 -right-1 bg-white border p-1.5 rounded-full">
              <Upload className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {userName?.split(' ')[0]}!</h1>
            <p className="text-gray-600">Here's how your store is performing.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View All Orders Button */}
          <Link 
            href="/seller/orders" 
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            View All Orders
          </Link>

          <Link href="/seller/edit-profile" className="border px-4 py-2 rounded-xl text-sm hover:bg-gray-50">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold">R{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Pending in Escrow</p>
          <p className="text-3xl font-bold text-amber-600">R{pendingEscrow.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Active Listings</p>
          <p className="text-3xl font-bold">{activeListings.length}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-3xl font-bold">
            {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {/* Received Orders */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#1E3A5F]">Received Orders ({receivedOrders.length})</h2>
          <Link href="/seller/orders" className="text-[#2E8B57] hover:underline text-sm">View All →</Link>
        </div>

        {receivedOrders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">
            You haven't received any orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {receivedOrders.slice(0, 8).map((order) => {
              const escrow = escrowMap[order.id];
              const canShip = order.status === 'paid';
              const canRequestRelease = order.status === 'shipped' && escrow?.status === 'held';

              return (
                <div key={order.id} className="bg-white border rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-2xl font-bold mt-1">R{(order.total_amount || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.created_at).toLocaleDateString()} • {order.payment_method || 'PayFast'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-sm rounded-full capitalize font-medium ${
                      order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'shipped' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>

                    {canShip && (
                      <button onClick={() => markAsShipped(order.id)} disabled={updatingOrderId === order.id} className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-5 py-2 rounded-xl text-sm font-medium disabled:bg-gray-400">
                        Mark as Shipped
                      </button>
                    )}

                    {canRequestRelease && (
                      <button onClick={() => requestEscrowRelease(order.id)} disabled={updatingOrderId === order.id} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-medium disabled:bg-gray-400">
                        Request Escrow Release
                      </button>
                    )}

                    {escrow?.status === 'release_requested' && <span className="text-purple-600 text-sm font-medium">Release Requested</span>}
                    {escrow?.status === 'released' && <span className="text-green-600 text-sm font-medium">Escrow Released ✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Listings */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Active Listings ({activeListings.length})</h2>
          <Link href="/create-listing" className="bg-[#2E8B57] text-white px-4 py-2 rounded-xl text-sm">+ New Listing</Link>
        </div>

        {activeListings.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-600">No active listings yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeListings.map((listing) => {
              const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';
              return (
                <div key={listing.id} className="bg-white border rounded-2xl overflow-hidden group">
                  <img src={image} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition" />
                  <div className="p-5">
                    <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
                    <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>

                    <div className="flex gap-2 mt-4">
                      <Link href={`/create-listing?edit=${listing.id}`} className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-sm py-2 rounded-xl hover:bg-gray-50">
                        <Edit className="w-4 h-4" /> Edit
                      </Link>
                      <button onClick={() => markAsSold(listing.id)} disabled={updatingListingId === listing.id} className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white text-sm py-2 rounded-xl hover:bg-green-700 disabled:bg-gray-400">
                        <CheckCircle className="w-4 h-4" /> Sold
                      </button>
                      <button onClick={() => deleteListing(listing.id)} disabled={updatingListingId === listing.id} className="px-3 text-red-600 hover:bg-red-50 rounded-xl border border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sold Listings */}
      {soldListings.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Recent Sales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {soldListings.slice(0, 8).map((listing) => {
              const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';
              return (
                <div key={listing.id} className="bg-white border rounded-2xl overflow-hidden opacity-90">
                  <img src={image} alt={listing.title} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="text-xl font-bold mt-2">R{listing.price.toLocaleString()}</p>
                    <div className="mt-2 text-sm text-green-600 font-medium">✓ Sold</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-6">Update Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border mb-6">
                {newAvatarPreview ? <img src={newAvatarPreview} className="w-full h-full object-cover" /> : 
                 userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : 
                 <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-4xl">{userName?.[0]}</div>}
              </div>
              <label className="cursor-pointer border px-6 py-2 rounded-xl mb-4">Choose New Photo
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowAvatarModal(false)} className="flex-1 border py-3 rounded-2xl">Cancel</button>
                <button onClick={handleAvatarUpload} disabled={!newAvatarFile || uploadingAvatar} className="flex-1 bg-[#2E8B57] text-white py-3 rounded-2xl">Save Photo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}