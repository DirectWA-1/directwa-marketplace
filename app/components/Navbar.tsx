'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Fetch user + profile data
  const fetchUserProfile = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, location')
      .eq('id', userId)
      .single();

    if (profile) {
      setUserName(profile.full_name || '');
      setUserLocation(profile.location || '');
    }
  };

  // Check auth state
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        await fetchUserProfile(user.id);
      }
      setLoading(false);
    };

    getUser();

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserName('');
          setUserLocation('');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ✅ Real-time profile updates (name & location)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          if (updatedProfile.full_name) setUserName(updatedProfile.full_name);
          if (updatedProfile.location) setUserLocation(updatedProfile.location);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Wishlist & Cart counts
  const updateCounts = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistCount(wishlist.length);

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('storage', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    window.addEventListener('cartUpdated', updateCounts);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
      window.removeEventListener('cartUpdated', updateCounts);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div>
      {/* Top Dark Navbar */}
      <nav className="bg-[#1E3A5F] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              DirectWA
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="flex w-full">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
                />
                <button type="submit" className="bg-[#2E8B57] px-4 rounded-r-lg hover:bg-[#246B46]">
                  🔍
                </button>
              </div>
            </form>

            {/* Right Side Icons */}
            <div className="flex items-center gap-5">
              <Link href="/wishlist" className="relative hover:text-gray-300">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative flex items-center gap-1 hover:text-gray-300">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
                <span className="hidden lg:inline">Cart</span>
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-4 text-sm">
                      <Link href="/seller/dashboard" className="hover:text-gray-300">
                        Seller Dashboard
                      </Link>
                      <button onClick={handleLogout} className="hover:text-gray-300">
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm">
                      <Link href="/login" className="hover:text-gray-300">Login</Link>
                      <Link href="/signup" className="bg-white text-[#1E3A5F] px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100">
                        Sign Up
                      </Link>
                    </div>
                  )}
                </>
              )}

              <Link href="/create-listing" className="bg-[#2E8B57] hover:bg-[#246B46] px-5 py-2 rounded-full text-sm font-semibold">
                Sell an Item
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navbar with Real-time Name + Location */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-11 text-sm font-medium text-gray-700">
            
            {/* Left Links */}
            <div className="flex items-center gap-6">
              <Link href="/listings" className="hover:text-[#2E8B57]">All Listings</Link>
              <Link href="/create-listing" className="hover:text-[#2E8B57]">Sell</Link>
              <Link href="/how-it-works" className="hover:text-[#2E8B57]">How it Works</Link>
              <Link href="/escrow-protection" className="hover:text-[#2E8B57]">Escrow</Link>
            </div>

            {/* ✅ Real-time Name + Location */}
            {!loading && user && (userName || userLocation) && (
              <div className="hidden md:flex items-center text-sm text-gray-600 font-medium">
                {userName && <span>{userName}</span>}
                {userName && userLocation && <span className="mx-1.5 text-gray-400">•</span>}
                {userLocation && <span>{userLocation}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}