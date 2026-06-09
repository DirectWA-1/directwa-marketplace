import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://directwa.co.za';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/create-listing`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
    },
  ];
}