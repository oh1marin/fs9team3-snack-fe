/**
 * 원본 이미지 URL 반환 (CDN 미적용)
 * - 절대 URL(http/https) → 그대로 반환
 * - 상대 경로(/uploads/...) → NEXT_PUBLIC_API_URL 붙여서 반환
 */
export function getRawImageSrc(image: string | null | undefined): string {
  const raw = typeof image === "string" ? image.trim() : "";
  if (!raw) return "";
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("//")
  ) {
    return raw;
  }
  const base =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "";
  const baseClean = base.replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return baseClean ? `${baseClean}${path}` : path;
}

/**
 * 상품/장바구니/주문 이미지 표시용.
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME 설정 시: Cloudinary CDN 경유 (f_auto, q_auto)
 * - 미설정 시: 원본 URL 그대로
 * - width: CDN 사용 시 리사이즈 너비 (기본 800)
 */
export function getImageSrc(
  image: string | null | undefined,
  width = 800,
): string {
  const src = getRawImageSrc(image);
  if (!src) return "";

  // blob/data URL은 CDN 통과 불가
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;

  const cloudName =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return src;

  const opts = `w_${width},f_auto,q_auto`;
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${opts}/${encodeURIComponent(src)}`;
}
