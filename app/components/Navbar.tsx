'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="DirectWA" 
              width={150} 
              height={42} 
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/listings" className="hover:text-[#2E8B57]">Browse</Link>
            <Link href="/how-it-works" className="hover:text-[#2E8B57]">How it Works</Link>
            <Link href="/escrow-protection" className="hover:text-[#2E8B57]">Escrow</Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/create-listing" 
              className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
            >
              Sell an Item
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-2 text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 text-sm font-medium">
          <Link href="/listings" className="block py-2">Browse</Link>
          <Link href="/how-it-works" className="block py-2">How it Works</Link>
          <Link href="/escrow-protection" className="block py-2">Escrow</Link>
          <Link 
            href="/create-listing" 
            className="block bg-[#2E8B57] text-white text-center py-3 rounded-xl mt-2"
          >
            Sell an Item
          </Link>
        </div>
      )}
    </nav>
  );
}