import ListingDetailClient from './ListingDetailClient';
import { supabase } from '@/lib/supabase';

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

export default function ListingDetailPage() {
  return <ListingDetailClient />;
}