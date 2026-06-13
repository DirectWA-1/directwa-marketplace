'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

// ==================== INTERFACES ====================
interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  created_at: string;
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

  // Avatar Modal States
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
      .select('id, title, price, location, images, created_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (activeData) setActiveListings(activeData);

    // Sold Listings
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
        escrowData.forEach(e => map[e.order_id] = e);
        setEscrowMap(map);
      }
    }

    setLoading(false);
  };

  // ==================== ACTIONS ====================
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

  // Avatar handlers (keep your existing ones)
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
      {/* Header with Avatar */}
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
        <Link href="/seller/edit-profile" className="border px-4 py-2 rounded-xl text-sm">Edit Profile</Link>
      </div>

      {/* Earnings Overview */}
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
          <p className="text-3xl font-bold">{reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '—'}</p>
        </div>
      </div>

      {/* Received Orders with Escrow */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Received Orders ({receivedOrders.length})</h2>
        {receivedOrders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center">No orders yet.</div>
        ) : (
          <div className="bg-white border rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 text-sm">
                <tr>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Escrow</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {receivedOrders.map(order => {
                  const escrow = escrowMap[order.id];
                  return (
                    <tr key={order.id} className="border-t">
                      <td className="p-4 font-mono text-sm">{order.id.slice(0,8)}...</td>
                      <td className="p-4 font-semibold">R{order.total_amount}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 capitalize">{order.status}</span>
                      </td>
                      <td className="p-4 text-sm capitalize">{escrow?.status?.replace('_',' ') || '—'}</td>
                      <td className="p-4 text-right">
                        {order.status === 'paid' && (
                          <button onClick={() => markAsShipped(order.id)} disabled={updatingOrderId === order.id}
                            className="bg-[#2E8B57] text-white px-4 py-2 rounded-xl text-sm">
                            Mark as Shipped
                          </button>
                        )}
                        {order.status === 'shipped' && escrow?.status === 'held' && (
                          <button onClick={() => requestEscrowRelease(order.id)} disabled={updatingOrderId === order.id}
                            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm">
                            Request Release
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Listings */}
      <div>
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold">Active Listings ({activeListings.length})</h2>
          <Link href="/create-listing" className="bg-[#2E8B57] text-white px-4 py-2 rounded-xl text-sm">+ New</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeListings.map(listing => {
            const img = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';
            return (
              <Link href={`/listings/${listing.id}`} key={listing.id}>
                <div className="bg-white border rounded-2xl overflow-hidden hover:shadow">
                  <img src={img} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="text-xl font-bold mt-1">R{listing.price}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-6">Update Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border mb-6">
                {newAvatarPreview ? <img src={newAvatarPreview} className="w-full h-full object-cover" /> : 
                 userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : 
                 <div className="w-full h-full bg-[#2E8B57] flex items-center justify-center text-white text-4xl">{userName?.[0]}</div>}
              </div>
              <label className="cursor-pointer border px-6 py-2 rounded-xl mb-4">Choose Photo
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowAvatarModal(false)} className="flex-1 border py-3 rounded-2xl">Cancel</button>
                <button onClick={handleAvatarUpload} disabled={!newAvatarFile || uploadingAvatar} className="flex-1 bg-[#2E8B57] text-white py-3 rounded-2xl">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}