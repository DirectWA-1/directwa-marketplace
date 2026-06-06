'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  created_at: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  const categories = ['Electronics', 'Fashion & Clothing', 'Home & Garden', 'Vehicles & Parts', 'Other'];

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
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

  // Apply filters + sorting
  useEffect(() => {
    let result = [...listings];

    if (searchTerm) {
      result = result.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory) {
      result = result.filter(l => l.category === selectedCategory);
    }
    if (minPrice) result = result.filter(l => l.price >= parseFloat(minPrice));
    if (maxPrice) result = result.filter(l => l.price <= parseFloat(maxPrice));

    // Sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'title-az':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredListings(result);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortOption, listings]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
  };

  const openWhatsApp = (listing: Listing) => {
    const message = encodeURIComponent(`Hi, I'm interested in your "${listing.title}" on DirectWA.`);
    window.open(`https://wa.me/27721234567?text=${message}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center">Loading listings...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1E3A5F]">Browse Listings</h1>
          <p className="text-gray-600">Discover great deals from our community</p>
        </div>
        <Link href="/sell" className="bg-[#2E8B57] text-white px-5 py-2.5 rounded-xl font-semibold">
          + Sell Item
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search listings..."
              className="w-full border rounded-xl px-4 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select className="w-full border rounded-xl px-4 py-3" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <input type="number" placeholder="Min R" className="w-full border rounded-xl px-4 py-3" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <input type="number" placeholder="Max R" className="w-full border rounded-xl px-4 py-3" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <select className="w-full border rounded-xl px-4 py-3" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="title-az">Title: A → Z</option>
            </select>

            <button 
              onClick={clearFilters}
              className="px-4 py-3 text-sm border rounded-xl hover:bg-gray-50 whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
      </div>

      {filteredListings.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <p className="text-gray-500">No listings found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative">
                <img 
                  src={listing.images?.[0] || 'https://picsum.photos/id/20/400/300'} 
                  alt={listing.title} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                {listing.category && (
                  <div className="absolute top-3 left-3 bg-white/90 text-[#1E3A5F] text-xs font-medium px-3 py-1 rounded-full">
                    {listing.category}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
                <div className="text-2xl font-bold text-[#1E3A5F] mb-3">R{listing.price.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mb-4">📍 {listing.location}</div>
                <div className="flex gap-2">
                  <button onClick={() => openWhatsApp(listing)} className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3 rounded-xl text-sm">
                    Chat on WhatsApp
                  </button>
                  <Link href={`/listings/${listing.id}`} className="px-5 py-3 border rounded-xl text-sm font-medium hover:bg-gray-50">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 