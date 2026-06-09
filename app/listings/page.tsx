'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';   // ✅ This fixes the prerender error

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  category: string;
  condition: string;
  created_at: string;
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || '';

  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['Electronics', 'Fashion & Clothing', 'Home & Garden', 'Vehicles & Parts', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('listings')
        .select('id, title, price, location, images, category, condition, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (data) {
        setListings(data);
        setFilteredListings(data);
      }
      setLoading(false);
    };

    fetchListings();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...listings];

    const activeSearch = searchTerm || urlSearchTerm;
    if (activeSearch) {
      const term = activeSearch.toLowerCase();
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(term) ||
          listing.location.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      result = result.filter((listing) => listing.category === selectedCategory);
    }

    if (selectedCondition) {
      result = result.filter((listing) => listing.condition === selectedCondition);
    }

    if (minPrice) result = result.filter((l) => l.price >= parseInt(minPrice));
    if (maxPrice) result = result.filter((l) => l.price <= parseInt(maxPrice));

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredListings(result);
  }, [searchTerm, selectedCategory, selectedCondition, minPrice, maxPrice, sortBy, listings, urlSearchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedCondition || minPrice || maxPrice || sortBy !== 'newest';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-10 w-64 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#1E3A5F]">All Listings</h1>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-xl hover:bg-red-50">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-2xl p-6 sticky top-6">
            <h3 className="font-semibold text-lg mb-4">Filters</h3>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5">Search</label>
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm">
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5">Condition</label>
              <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm">
                <option value="">Any Condition</option>
                {conditions.map((cond) => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Price Range (R)</label>
              <div className="flex gap-3">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm" />
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {filteredListings.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center">
              <p className="text-gray-600 mb-4">No listings found.</p>
              <button onClick={clearFilters} className="text-[#2E8B57] hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const image = listing.images?.[0] || 'https://picsum.photos/id/20/400/300';
                return (
                  <Link href={`/listings/${listing.id}`} key={listing.id}>
                    <div className="bg-white border rounded-2xl overflow-hidden group hover:shadow-md transition">
                      <img src={image} alt={listing.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
                      <div className="p-5">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-[#2E8B57]">{listing.title}</h3>
                        <p className="text-xl font-bold text-[#1E3A5F] mt-2">R{listing.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>
                        <div className="flex gap-2 mt-3">
                          {listing.category && <span className="text-xs bg-gray-100 px-2.5 py-0.5 rounded-full">{listing.category}</span>}
                          {listing.condition && <span className="text-xs bg-gray-100 px-2.5 py-0.5 rounded-full">{listing.condition}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}