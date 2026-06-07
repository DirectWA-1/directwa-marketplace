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
          <Link href="/" className="text-2xl font-bold text-[#1E3A5F]">
            DirectWA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/listings" className="text-gray-700 hover:text-[#1E3A5F]">
              Browse
            </Link>
            <Link href="/sell" className="text-gray-700 hover:text-[#1E3A5F]">
              Sell
            </Link>
            <Link 
              href="/login" 
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Login
            </Link>
            <Link 
              href="/sell" 
              className="px-5 py-2 rounded-xl bg-[#2E8B57] text-white hover:bg-[#246B46]"
            >
              Start Selling
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-gray-700"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t flex flex-col gap-4 text-sm">
            <Link href="/listings" className="text-gray-700">Browse</Link>
            <Link href="/sell" className="text-gray-700">Sell</Link>
            <Link href="/login" className="text-gray-700">Login</Link>
            <Link href="/sell" className="bg-[#2E8B57] text-white px-4 py-2 rounded-xl text-center">
              Start Selling
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}