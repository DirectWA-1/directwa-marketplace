'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Profile = {
  full_name: string | null;
  location: string | null;
};

export default function Navbar() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, location')
      .eq('id', userId)
      .single();

    const profile = data as Profile | null;
    setUserName(profile?.full_name || '');
    setUserLocation(profile?.location || '');
  };

  const resetUserState = () => {
    setUser(null);
    setUserName('');
    setUserLocation('');
  };

  const updateCounts = () => {
    if (typeof window === 'undefined') return;
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      setCartCount(Array.isArray(cart) ? cart.length : 0);
    } catch {
      setWishlistCount(0);
      setCartCount(0);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (currentUser) {
        setUser(currentUser);
        await fetchUserProfile(currentUser.id);
      } else {
        resetUserState();
      }
      if (isMounted) setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser) {
        setUser(sessionUser);
        await fetchUserProfile(sessionUser.id);
      } else {
        resetUserState();
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    updateCounts();
    window.addEventListener('storage', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts as EventListener);
    window.addEventListener('cartUpdated', updateCounts as EventListener);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts as EventListener);
      window.removeEventListener('cartUpdated', updateCounts as EventListener);
    };
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/listings?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetUserState();
    router.push('/');
  };

  return (
    <div>
      {/* Main Navbar */}
      <nav className="bg-[#1E3A5F] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold">DirectWA</Link>

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

            <div className="flex items-center gap-5">
              <Link href="/wishlist" className="relative hover:text-gray-300">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="relative hover:text-gray-300">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {!loading && user ? (
                <div className="flex items-center gap-4 text-sm">
                  <Link href="/my-purchases" className="hover:text-gray-300">My Purchases</Link>
                  <Link href="/seller/dashboard" className="hover:text-gray-300">Seller Dashboard</Link>
                  <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <Link href="/login" className="hover:text-gray-300">Login</Link>
                  <Link href="/signup" className="bg-white text-[#1E3A5F] px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100">
                    Sign Up
                  </Link>
                </div>
              )}

              <Link href="/create-listing" className="bg-[#2E8B57] hover:bg-[#246B46] px-5 py-2 rounded-full text-sm font-semibold">
                Sell an Item
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation Bar */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-11 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-6">
              <Link href="/listings" className="hover:text-[#2E8B57]">All Listings</Link>
              <Link href="/create-listing" className="hover:text-[#2E8B57]">Sell</Link>
              <Link href="/how-it-works" className="hover:text-[#2E8B57]">How it Works</Link>
              <Link href="/escrow-protection" className="hover:text-[#2E8B57]">Escrow</Link>
              <Link href="/pricing" className="hover:text-[#2E8B57]">Pricing</Link>
            </div>

            {!loading && user && (userName || userLocation) && (
              <div className="hidden md:flex items-center text-sm text-gray-600">
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