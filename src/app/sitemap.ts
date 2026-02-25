import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marin-snack.store";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily" as const },
    {
      url: `${base}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${base}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
    },
    {
      url: `${base}/items`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
    },
  ];
}
