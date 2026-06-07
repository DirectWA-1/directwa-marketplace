'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#1E3A5F]">
              DirectWA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <Link 
              href="/listings" 
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-xl transition-colors"
            >
              Browse
            </Link>
            <Link 
              href="/sell" 
              className="px-4 py-2 text-gray-700 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-xl transition-colors"
            >
              Sell
            </Link>

            <div className="w-px h-6 bg-gray-200 mx-2" />

            <Link 
              href="/login" 
              className="px-5 py-2 text-gray-700 hover:text-[#1E3A5F] border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/sell" 
              className="px-5 py-2 bg-[#2E8B57] hover:bg-[#246B46] text-white rounded-xl transition-colors font-medium"
            >
              Start Selling
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 text-gray-700"
            aria-label="Toggle menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1 text-sm border-t pt-4">
            <Link href="/listings" className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl">Browse Listings</Link>
            <Link href="/sell" className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl">Start Selling</Link>
            <div className="h-px bg-gray-200 my-2" />
            <Link href="/login" className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl">Login</Link>
            <Link href="/sell" className="mx-4 mt-2 bg-[#2E8B57] text-white text-center py-3 rounded-xl font-medium">
              Start Selling Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
} 