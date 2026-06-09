'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Live cart count
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
    setMobileMenuOpen(false);
    window.location.href = '/login';
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-[22px] font-semibold tracking-tight text-[#1E3A5F]">
          DirectWA
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-9 text-[15px] font-medium text-gray-700">
          <Link href="/listings" className="hover:text-[#2E8B57] transition-colors">
            Browse
          </Link>
          <Link href="/create-listing" className="hover:text-[#2E8B57] transition-colors">
            Sell
          </Link>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-2">
          
          {/* Wishlist */}
          <Link 
            href="/wishlist" 
            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart className="w-5 h-5 text-gray-600" />
          </Link>

          {/* Cart */}
          <Link 
            href="/cart" 
            className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#2E8B57] text-white text-[10px] min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-1 ml-2">
              <Link 
                href="/my-listings" 
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                My Listings
              </Link>
              <Link 
                href="/seller/dashboard" 
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="ml-2 px-5 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link 
                href="/login" 
                className="px-5 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2 text-sm font-medium bg-[#2E8B57] hover:bg-[#246B46] text-white rounded-xl transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ==================== MOBILE MENU ==================== */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeMobileMenu} />
          
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl md:hidden">
            <div className="flex items-center justify-between px-5 h-16 border-b">
              <span className="text-xl font-semibold text-[#1E3A5F]">DirectWA</span>
              <button onClick={closeMobileMenu}><X className="w-6 h-6" /></button>
            </div>

            <div className="px-5 py-6 text-sm space-y-1">
              <Link href="/listings" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">Browse Listings</Link>
              <Link href="/create-listing" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">Sell an Item</Link>
              <Link href="/wishlist" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">Wishlist</Link>
              <Link href="/cart" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">Cart ({cartCount})</Link>

              <div className="my-3 border-t" />

              {user ? (
                <>
                  <Link href="/my-listings" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">My Listings</Link>
                  <Link href="/seller/dashboard" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">Seller Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left py-3 px-3 text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">Login</Link>
                  <Link href="/signup" onClick={closeMobileMenu} className="block py-3 px-3 rounded-lg hover:bg-gray-100">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}