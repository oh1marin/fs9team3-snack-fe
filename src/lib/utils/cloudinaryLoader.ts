/**
 * Next.js Image custom loader
 * - 외부 URL(API, S3): Cloudinary fetch로 리사이즈·최적화 (f_auto, q_auto)
 * - 로컬 경로(/), blob, data: Next.js 기본 (Vercel Image Optimization)
 */
export default function cloudinaryLoader({
  src,
  width,
  quality = 75,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // blob, data → 그대로 (최적화 불가)
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return src;
  }
  // 로컬 경로 → Next 기본 (Vercel Image Optimization)
  if (src.startsWith("/")) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
  }

  // Cloudinary 미설정 → Next 기본
  if (!cloudName) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
  }

  const opts = `w_${width},q_${quality},f_auto`;
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${opts}/${encodeURIComponent(src)}`;
}
