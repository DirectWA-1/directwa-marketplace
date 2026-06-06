'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  condition: string;
  category: string;
  images: string[];
}

export default function ListingDetail() {
  const params = useParams();
  const id = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setListing(data);
    }
    setLoading(false);
  };

  const openWhatsApp = () => {
    if (!listing) return;
    const message = encodeURIComponent(
      `Hi, I'm interested in your "${listing.title}" on DirectWA. Is it still available?`
    );
    window.open(`https://wa.me/27721234567?text=${message}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!listing) return <div className="p-8 text-center">Listing not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Back to all listings
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <img 
            src={listing.images?.[0] || 'https://picsum.photos/id/20/800/600'} 
            alt={listing.title}
            className="w-full rounded-2xl shadow-sm aspect-[4/3] object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">{listing.title}</h1>
          <div className="text-4xl font-bold mb-6 text-[#1E3A5F]">R{listing.price.toLocaleString()}</div>

          <div className="space-y-4 mb-8 text-sm">
            <div><span className="text-gray-500">Location:</span> <span className="font-medium">{listing.location}</span></div>
            <div><span className="text-gray-500">Condition:</span> <span className="font-medium">{listing.condition}</span></div>
            <div><span className="text-gray-500">Category:</span> <span className="font-medium">{listing.category}</span></div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={openWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-4 rounded-xl text-lg"
            >
              💬 Chat with Seller on WhatsApp
            </button>
            
            <Link 
              href={`/escrow/${listing.id}`}
              className="w-full border-2 border-[#1E3A5F] text-[#1E3A5F] font-semibold py-4 rounded-xl hover:bg-gray-50 transition-colors text-center block"
            >
              Pay Securely via Platform (Escrow)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}