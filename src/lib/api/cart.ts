import { fetchJSON, apiClient } from "./apiClient";

export interface CartItemDto {
  id: string;
  /** 상품 ID (주문 시 item_id로 전송). BE가 item_id 주면 여기 들어감 */
  itemId?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartResponse {
  items: CartItemDto[];
}

/** BE 응답 한 줄을 id/title/price/image/quantity(camelCase)로 통일. item 객체로 넘어와도 처리 */
function toCartItemDto(d: Record<string, unknown>): CartItemDto {
  const itemObj = (d.item ?? d.product) as Record<string, unknown> | null | undefined;
  const id = String(d.id ?? "");
  const itemId = String(d.item_id ?? d.id ?? itemObj?.id ?? "").trim();
  const image = String(
    d.image ?? d.image_url ?? d.img ?? d.picture
    ?? itemObj?.image ?? itemObj?.image_url
    ?? ""
  ).trim();
  const title = String(d.title ?? itemObj?.title ?? "").trim();
  const price = Number(d.price ?? d.unit_price ?? d.total_price ?? itemObj?.price ?? 0);
  return {
    id: id || itemId,
    itemId: itemId || id,
    title: title || "상품",
    price,
    image,
    quantity: Number(d.quantity ?? 1),
  };
}

function normalizeCartResponse(raw: unknown): CartResponse {
  if (Array.isArray(raw)) {
    return { items: raw.map((x) => toCartItemDto((x as Record<string, unknown>) ?? {})) };
  }
  const obj = raw as Record<string, unknown> | null;
  if (!obj) return { items: [] };
  const list = obj.items ?? obj.data ?? obj.cart;
  const arr = Array.isArray(list) ? list : [];
  return { items: arr.map((x) => toCartItemDto((x as Record<string, unknown>) ?? {})) };
}

/** 장바구니 목록 조회 (BE snake_case 수용) */
export async function fetchCart(): Promise<CartResponse> {
  const raw = await fetchJSON<unknown>("/api/cart");
  return normalizeCartResponse(raw);
}

/** 장바구니에 상품 추가 (BE는 item_id 문자열, snake_case 요구) */
export async function addCartItem(body: {
  itemId: string;
  quantity: number;
  title?: string;
  price?: number;
  image?: string;
}): Promise<CartResponse> {
  const payload = {
    item_id: String(body.itemId),
    quantity: Number(body.quantity) || 1,
    ...(body.title != null && { title: body.title }),
    ...(body.price != null && { price: body.price }),
    ...(body.image != null && { image: body.image }),
  };
  const res = await apiClient("/api/cart/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "장바구니 담기에 실패했습니다.");
  }
  const raw = await res.json();
  return normalizeCartResponse(raw);
}

/** 장바구니 수량 변경 (BE가 quantity만 받으면 그대로, snake_case 요구 시 quantity 유지) */
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartResponse> {
  const res = await apiClient(`/api/cart/items/${String(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "수량 변경에 실패했습니다.");
  }
  const raw = await res.json();
  return normalizeCartResponse(raw);
}

/** 장바구니 상품 삭제 */
export async function removeCartItem(itemId: string): Promise<CartResponse> {
  const res = await apiClient(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "삭제에 실패했습니다.");
  }
  if (res.status === 204) return { items: [] };
  const raw = await res.json();
  return normalizeCartResponse(raw);
}

/** 장바구니 비우기 */
export async function clearCart(): Promise<CartResponse> {
  const res = await apiClient("/api/cart", { method: "DELETE" });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "장바구니 비우기에 실패했습니다.");
  }
  return { items: [] };
}
