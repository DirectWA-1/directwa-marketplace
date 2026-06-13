'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, ShoppingCart, User } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#2E8B57] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="font-bold text-2xl text-[#1E3A5F]">DirectWA</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Search listings..."
              className="w-full bg-gray-100 border-0 rounded-2xl px-5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2E8B57]"
            />
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-2">
            {/* Main Links */}
            <div className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/listings" className="px-4 py-2 hover:bg-gray-100 rounded-xl">All Listings</Link>
              <Link href="/sell" className="px-4 py-2 hover:bg-gray-100 rounded-xl">Sell</Link>
              <Link href="/how-it-works" className="px-4 py-2 hover:bg-gray-100 rounded-xl">How it Works</Link>
              <Link href="/escrow" className="px-4 py-2 hover:bg-gray-100 rounded-xl">Escrow</Link>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-1">
              {user ? (
                <>
                  {/* My Purchases Link */}
                  <Link 
                    href="/my-purchases" 
                    className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl text-sm font-medium"
                  >
                    My Purchases
                  </Link>

                  <Link href="/wishlist" className="p-2.5 hover:bg-gray-100 rounded-xl">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link href="/cart" className="p-2.5 hover:bg-gray-100 rounded-xl relative">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-[#2E8B57] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <span className="hidden md:block text-sm font-medium">Account</span>
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border rounded-2xl shadow-lg py-2 text-sm z-50">
                        <Link href="/seller/dashboard" className="block px-4 py-2.5 hover:bg-gray-50">Seller Dashboard</Link>
                        <Link href="/my-purchases" className="block px-4 py-2.5 hover:bg-gray-50 md:hidden">My Purchases</Link>
                        <Link href="/my-listings" className="block px-4 py-2.5 hover:bg-gray-50">My Listings</Link>
                        <Link href="/profile" className="block px-4 py-2.5 hover:bg-gray-50">Profile Settings</Link>
                        <div className="border-t my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-gray-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-5 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-[#2E8B57] text-white px-5 py-2 rounded-2xl text-sm font-semibold">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Sell Button */}
              <Link 
                href="/create-listing" 
                className="ml-2 bg-[#2E8B57] hover:bg-[#246B46] text-white px-6 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
              >
                Sell an Item
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}