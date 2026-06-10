'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = 1; // You can connect this to real cart state later

  return (
    <div>
      {/* Top Navbar - Dark Navy */}
      <nav className="bg-[#1E3A5F] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              DirectWA
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="flex w-full">
                <input
                  type="text"
                  placeholder="Search listings..."
                  className="flex-1 px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
                />
                <button className="bg-[#2E8B57] px-4 rounded-r-lg hover:bg-[#246B46]">
                  🔍
                </button>
              </div>
            </div>

            {/* Right Side Icons & Buttons */}
            <div className="flex items-center gap-4">
              {/* Wishlist */}
              <Link href="/wishlist" className="hidden md:block hover:text-gray-300">
                <Heart className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative hidden md:flex items-center gap-1 hover:text-gray-300">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
                <span className="hidden lg:inline">Cart</span>
              </Link>

              {/* Auth Buttons */}
              <Link 
                href="/login" 
                className="hidden md:block px-4 py-1.5 text-sm hover:text-gray-300"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="hidden md:block bg-[#2E8B57] hover:bg-[#246B46] px-4 py-1.5 rounded-lg text-sm font-medium"
              >
                Sign Up
              </Link>

              {/* Sell Button */}
              <Link 
                href="/create-listing" 
                className="bg-[#2E8B57] hover:bg-[#246B46] px-5 py-2 rounded-full text-sm font-semibold"
              >
                Sell an Item
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Nav Bar */}
      <div className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 h-11 text-sm font-medium text-gray-700">
            <Link href="/listings" className="hover:text-[#2E8B57]">All Listings</Link>
            <Link href="/create-listing" className="hover:text-[#2E8B57]">Sell</Link>
            <Link href="/how-it-works" className="hover:text-[#2E8B57]">How it Works</Link>
            <Link href="/escrow-protection" className="hover:text-[#2E8B57]">Escrow</Link>
          </div>
        </div>
      </div>
    </div>
  );
}