import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/my-listings', '/escrow'],
    },
    sitemap: 'https://directwa-marketplace-n85e.vercel.app/sitemap.xml',
  };
}