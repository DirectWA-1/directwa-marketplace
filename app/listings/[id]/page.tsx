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
  category: string;
  condition: string;
  images: string[];
  user_id: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_id: string;
}

export default function ListingDetail() {
  const params = useParams();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
      getCurrentUser();
    }
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchData = async () => {
    setLoading(true);

    const { data: listingData } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (listingData) setListing(listingData);

    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', id)
      .order('created_at', { ascending: false });

    if (reviewData) {
      setReviews(reviewData);
      if (reviewData.length > 0) {
        const avg = reviewData.reduce((sum, r) => sum + r.rating, 0) / reviewData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    }
    setLoading(false);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    setSubmitting(true);
    setReviewMessage('');

    const { error } = await supabase.from('reviews').insert({
      listing_id: listing.id,
      reviewer_id: user.id,
      seller_id: listing.user_id,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      setReviewMessage('Error: ' + error.message);
    } else {
      if (typeof window !== "undefined" && (window as any).plausible) {
        (window as any).plausible("review_submitted", {
          props: {
            rating: rating,
            hasComment: !!comment.trim(),
          },
        });
      }

      setReviewMessage('Thank you! Your review was submitted.');
      setComment('');
      setRating(5);
      fetchData();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!listing) return <div className="p-8 text-center">Listing not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Back to all listings
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img 
            src={listing.images?.[0] || 'https://picsum.photos/id/20/800/600'} 
            alt={listing.title}
            className="w-full rounded-2xl shadow-sm aspect-[4/3] object-cover border"
          />
        </div>

        <div>
          <div className="flex gap-2 mb-3">
            {listing.category && <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{listing.category}</span>}
            {listing.condition && <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{listing.condition}</span>}
          </div>

          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">{listing.title}</h1>

          {averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="text-yellow-500 text-2xl">{'★'.repeat(Math.round(averageRating))}</div>
              <span className="text-xl font-semibold">{averageRating}</span>
              <span className="text-gray-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}

          <div className="text-4xl font-bold text-[#1E3A5F] mb-6">R{listing.price.toLocaleString()}</div>
          <div className="mb-6 text-sm text-gray-600">📍 {listing.location}</div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2 text-lg">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-4 rounded-2xl text-lg">
              💬 Chat with Seller on WhatsApp
            </button>
            <Link href={`/escrow/${listing.id}`} className="w-full border-2 border-[#1E3A5F] text-[#1E3A5F] font-semibold py-4 rounded-2xl hover:bg-gray-50 transition-colors text-center block">
              Pay Securely via Platform (Escrow)
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">Reviews</h2>

        {user && (
          <div className="bg-white border rounded-2xl p-6 mb-8">
            <h3 className="font-semibold mb-4">Leave a Review</h3>
            <form onSubmit={submitReview} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{rating} Star{rating > 1 ? 's' : ''}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  className="w-full border rounded-2xl px-4 py-3" 
                  rows={3} 
                  placeholder="Share your experience..."
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-70"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>

              {reviewMessage && <p className="text-sm text-[#2E8B57]">{reviewMessage}</p>}
            </form>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-500 text-lg">{'★'.repeat(review.rating)}</div>
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}

// ✅ Fixed generateMetadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: listing } = await supabase
    .from('listings')
    .select('title, price, location, category, description, images')
    .eq('id', params.id)
    .single();

  if (!listing) {
    return {
      title: "Listing Not Found | DirectWA",
    };
  }

  return {
    title: `${listing.title} - R${listing.price} | DirectWA`,
    description: `${listing.title} for R${listing.price} in ${listing.location}. ${listing.description?.slice(0, 140) || ''}`,
    openGraph: {
      title: `${listing.title} - R${listing.price}`,
      description: `${listing.title} available in ${listing.location} for R${listing.price}. Contact the seller directly on WhatsApp.`,
      images: listing.images?.[0] ? [{ url: listing.images[0] }] : [],
    },
  };
}