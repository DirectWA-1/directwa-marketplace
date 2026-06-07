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

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data: listing } = await supabase
    .from('listings')
    .select('title, price, location, category, description, images, condition')
    .eq('id', params.id)
    .single();

  // Structured Data (JSON-LD)
  const structuredData = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description || "",
        image: listing.images?.[0] || "",
        offers: {
          "@type": "Offer",
          url: `https://directwa-marketplace-n85e.vercel.app/listings/${params.id}`,
          priceCurrency: "ZAR",
          price: listing.price,
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "DirectWA Seller",
          },
        },
      }
    : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <ListingDetailClient />
    </>
  );
}