'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#1E3A5F]">
          DirectWA
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/listings" className="hover:text-[#2E8B57] transition-colors">
            Browse
          </Link>
          <Link href="/create-listing" className="hover:text-[#2E8B57] transition-colors">
            Sell
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Heart className="w-5 h-5 text-gray-700" />
          </Link>

          {/* Cart */}
          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2E8B57] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/my-listings" 
                className="px-4 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors hidden md:block"
              >
                My Listings
              </Link>
              <Link 
                href="/seller/dashboard" 
                className="px-4 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors hidden md:block"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-5 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2 text-sm bg-[#2E8B57] hover:bg-[#246B46] text-white rounded-xl transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}