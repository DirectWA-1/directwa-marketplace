'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Menu, X, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    window.location.href = '/login';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/listings?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      
      {/* ==================== TOP BAR (Amazon Style) ==================== */}
      <div className="bg-[#1E3A5F] text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight flex-shrink-0">
            DirectWA
          </Link>

          {/* Delivery Location (Amazon style) */}
          <div className="hidden md:flex items-center gap-1 text-sm cursor-pointer hover:bg-white/10 px-2 py-1 rounded">
            <MapPin className="w-4 h-4" />
            <div className="leading-tight">
              <div className="text-[10px] text-white/70">Deliver to</div>
              <div className="font-medium -mt-0.5">Johannesburg 2190</div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search listings..."
                className="flex-1 px-4 py-2 text-black rounded-l-md focus:outline-none text-sm"
              />
              <button 
                type="submit"
                className="bg-[#2E8B57] hover:bg-[#246B46] px-5 rounded-r-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-5 text-sm">
            
            {/* Account */}
            {user ? (
              <Link href="/seller/dashboard" className="hidden md:block hover:bg-white/10 px-3 py-1 rounded">
                <div className="text-[10px] text-white/70">Hello, {user.email?.split('@')[0]}</div>
                <div className="font-medium -mt-0.5">Account & Lists</div>
              </Link>
            ) : (
              <Link href="/login" className="hidden md:block hover:bg-white/10 px-3 py-1 rounded">
                <div className="text-[10px] text-white/70">Hello, sign in</div>
                <div className="font-medium -mt-0.5">Account & Lists</div>
              </Link>
            )}

            {/* Returns & Orders */}
            <Link href="/my-listings" className="hidden md:block hover:bg-white/10 px-3 py-1 rounded">
              <div className="text-[10px] text-white/70">Returns</div>
              <div className="font-medium -mt-0.5">& Orders</div>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-medium hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2E8B57] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== SECOND BAR ==================== */}
      <div className="bg-[#F1F5F9] border-b">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between text-sm">
          
          {/* Left Links */}
          <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
            <Link href="/listings" className="hover:text-[#2E8B57]">All Listings</Link>
            <Link href="/create-listing" className="hover:text-[#2E8B57]">Sell</Link>
            <Link href="/how-it-works" className="hover:text-[#2E8B57]">How it Works</Link>
            <Link href="/escrow-protection" className="hover:text-[#2E8B57]">Escrow</Link>
          </div>

          {/* Right Side Promo */}
          <div className="hidden md:block text-sm text-gray-600">
            <Link href="/seller/dashboard" className="hover:text-[#2E8B57]">
              Start selling today →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden flex items-center gap-2 text-sm font-medium"
          >
            <Menu className="w-5 h-5" /> Menu
          </button>
        </div>
      </div>

      {/* ==================== MOBILE MENU ==================== */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 text-sm">
          <div className="space-y-1">
            <Link href="/listings" onClick={() => setMobileMenuOpen(false)} className="block py-2">Browse Listings</Link>
            <Link href="/create-listing" onClick={() => setMobileMenuOpen(false)} className="block py-2">Sell an Item</Link>
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2">Wishlist</Link>
            <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2">How it Works</Link>
            
            <div className="border-t my-2" />

            {user ? (
              <>
                <Link href="/my-listings" onClick={() => setMobileMenuOpen(false)} className="block py-2">My Listings</Link>
                <Link href="/seller/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2">Login</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-2">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}