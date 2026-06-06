'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link href="/listings" className="text-gray-600 hover:text-[#1E3A5F] transition-colors">
              Browse
            </Link>
            <Link href="/sell" className="text-gray-600 hover:text-[#1E3A5F] transition-colors">
              Sell
            </Link>
            <Link href="/auctions" className="text-gray-600 hover:text-[#1E3A5F] transition-colors">
              Auctions
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link 
              href="/sell" 
              className="hidden md:block px-5 py-2 text-sm font-semibold border border-[#1E3A5F] text-[#1E3A5F] rounded-xl hover:bg-gray-50 transition-colors"
            >
              Start Selling
            </Link>
            
            <Link 
              href="/login" 
              className="px-5 py-2 text-sm font-semibold bg-[#1E3A5F] text-white rounded-xl hover:bg-[#152A45] transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}