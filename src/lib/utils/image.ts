/**
 * 상품/장바구니/주문 이미지 표시용.
 * - 절대 URL(http/https) → 그대로 반환
 * - 상대 경로(/uploads/...) → NEXT_PUBLIC_API_URL 붙여서 반환 (FE 도메인 404 방지)
 */
export function getImageSrc(image: string | null | undefined): string {
  const raw = typeof image === "string" ? image.trim() : "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("//")) {
    return raw;
  }
  const base = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "";
  const baseClean = base.replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return baseClean ? `${baseClean}${path}` : path;
}
