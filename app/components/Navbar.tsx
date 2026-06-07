'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#1E3A5F]">
            DirectWA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Link href="/listings" className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-xl transition-colors">
              Browse
            </Link>
            <Link href="/sell" className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-xl transition-colors">
              Sell
            </Link>

            {user && (
              <>
                <Link href="/my-listings" className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-xl transition-colors">
                  My Listings
                </Link>
                <Link href="/seller/setup" className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-xl transition-colors">
                  Seller Profile
                </Link>
              </>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {/* Cart */}
            <Link href="/cart" className="relative px-3 py-2 text-gray-700 hover:text-[#1E3A5F] flex items-center">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2E8B57] text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {user ? (
              <Link href="/my-listings" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#246B46] text-white rounded-xl font-medium">
                My Listings
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="px-5 py-2 bg-[#2E8B57] hover:bg-[#246B46] text-white rounded-xl font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-700">
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 text-sm border-t pt-4">
            <Link href="/listings" className="block px-4 py-3">Browse</Link>
            <Link href="/sell" className="block px-4 py-3">Sell</Link>
            
            {user && (
              <>
                <Link href="/my-listings" className="block px-4 py-3">My Listings</Link>
                <Link href="/seller/setup" className="block px-4 py-3">Seller Profile</Link>
              </>
            )}

            <Link href="/cart" className="block px-4 py-3 flex items-center gap-2">
              Cart {cartCount > 0 && <span className="bg-[#2E8B57] text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
            </Link>

            <div className="h-px bg-gray-200 my-2" />

            {user ? (
              <Link href="/my-listings" className="block mx-4 bg-[#2E8B57] text-white text-center py-3 rounded-xl">My Listings</Link>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-3">Login</Link>
                <Link href="/signup" className="block mx-4 bg-[#2E8B57] text-white text-center py-3 rounded-xl">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}