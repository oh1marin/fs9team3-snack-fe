import { MetadataRoute } from "next";

/**
 * 공개 페이지만 포함 (인증 필요 페이지 제외)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marin-snack.store";
  const now = new Date();
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/signup`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];
}
