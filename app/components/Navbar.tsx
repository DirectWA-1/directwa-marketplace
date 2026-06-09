'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false); // ← Prevents hydration error

  // Mark as client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Cart count (only after hydration)
  useEffect(() => {
    if (!isClient) return;

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, [isClient]);

  // Real-time Wishlist count
  useEffect(() => {
    if (!user || !isClient) return;

    const fetchWishlistCount = async () => {
      const { count } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setWishlistCount(count || 0);
    };

    fetchWishlistCount();

    const channel = supabase
      .channel('wishlist-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${user.id}` }, fetchWishlistCount)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isClient]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    window.location.href = '/login';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/listings?search=${encodeURIComponent(searchTerm.trim())}`;
    } else {
      window.location.href = '/listings';
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="bg-[#1E3A5F] text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold">DirectWA</Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full bg-white rounded-md overflow-hidden">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search listings..."
                className="flex-1 px-4 py-2 text-black text-sm focus:outline-none"
              />
              <button type="submit" className="bg-[#2E8B57] hover:bg-[#246B46] px-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-5 text-sm">
            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 hover:bg-white/10 rounded-full relative">
              <Heart className="w-5 h-5" />
              {isClient && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2E8B57] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-medium">Cart</span>
              {isClient && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2E8B57] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/my-listings" className="hover:bg-white/10 px-3 py-1 rounded">My Listings</Link>
                <Link href="/seller/dashboard" className="hover:bg-white/10 px-3 py-1 rounded">Dashboard</Link>
                <button onClick={handleLogout} className="px-4 py-1.5 text-sm border border-white/30 hover:bg-white/10 rounded">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hover:bg-white/10 px-3 py-1 rounded">Login</Link>
                <Link href="/signup" className="px-4 py-1.5 text-sm bg-[#2E8B57] hover:bg-[#246B46] rounded text-white">Sign Up</Link>
              </div>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Second Bar */}
      <div className="bg-[#F1F5F9] border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/listings" className="hover:text-[#2E8B57]">All Listings</Link>
          <Link href="/create-listing" className="hover:text-[#2E8B57]">Sell</Link>
          <Link href="/how-it-works" className="hover:text-[#2E8B57]">How it Works</Link>
          <Link href="/escrow-protection" className="hover:text-[#2E8B57]">Escrow</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl md:hidden">
            <div className="flex items-center justify-between px-5 h-16 border-b">
              <span className="text-xl font-semibold text-[#1E3A5F]">DirectWA</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="px-5 py-6 text-sm space-y-1">
              <Link href="/listings" onClick={closeMobileMenu} className="block py-3">Browse Listings</Link>
              <Link href="/create-listing" onClick={closeMobileMenu} className="block py-3">Sell an Item</Link>
              <Link href="/wishlist" onClick={closeMobileMenu} className="block py-3">Wishlist ({wishlistCount})</Link>
              <Link href="/cart" onClick={closeMobileMenu} className="block py-3">Cart ({cartCount})</Link>
              <Link href="/how-it-works" onClick={closeMobileMenu} className="block py-3">How it Works</Link>
              <div className="border-t my-3" />
              {user ? (
                <>
                  <Link href="/my-listings" onClick={closeMobileMenu} className="block py-3">My Listings</Link>
                  <Link href="/seller/dashboard" onClick={closeMobileMenu} className="block py-3">Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left py-3 text-red-600">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu} className="block py-3">Login</Link>
                  <Link href="/signup" onClick={closeMobileMenu} className="block py-3">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}