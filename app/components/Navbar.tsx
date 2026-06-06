'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const [user, setUser] = useState<any>(null);

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
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1E3A5F] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="font-bold text-xl text-[#1E3A5F]">DirectWA</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/listings" className="text-gray-600 hover:text-[#1E3A5F]">Browse</Link>
            <Link href="/sell" className="text-gray-600 hover:text-[#1E3A5F]">Sell</Link>
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <Link href="/login" className="bg-[#1E3A5F] text-white px-4 py-2 rounded-xl text-sm font-semibold">
                Log in
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sell" className="hidden md:block px-4 py-2 text-sm font-semibold border border-[#1E3A5F] rounded-xl">
                  Sell Item
                </Link>
                <Link href="/my-listings" className="text-sm text-gray-600 hover:text-[#1E3A5F]">My Listings</Link>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}