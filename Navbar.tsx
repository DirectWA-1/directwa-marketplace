'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1E3A5F] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="font-bold text-xl text-[#1E3A5F]">DirectWA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/listings" className="text-gray-600 hover:text-[#1E3A5F] transition-colors">Browse</Link>
            <Link href="/sell" className="text-gray-600 hover:text-[#1E3A5F] transition-colors">Sell</Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hidden md:block text-sm text-gray-600 hover:text-[#1E3A5F]">Log in</Link>
                <Link href="/sell" className="bg-[#2E8B57] text-white px-4 py-2 rounded-xl text-sm font-semibold">
                  Start Selling
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sell" className="hidden md:block px-4 py-2 text-sm font-semibold border border-[#1E3A5F] text-[#1E3A5F] rounded-xl hover:bg-gray-50">
                  Sell Item
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100">
                    <div className="w-8 h-8 bg-[#2E8B57] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg py-1 hidden group-hover:block">
                    <Link href="/my-listings" className="block px-4 py-2 text-sm hover:bg-gray-50">My Listings</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}