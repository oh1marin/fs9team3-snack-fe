import { fetchJSON, apiClient } from "./apiClient";

export interface CartItemDto {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartResponse {
  items: CartItemDto[];
}

/** 장바구니 목록 조회 */
export async function fetchCart(): Promise<CartResponse> {
  const raw = await fetchJSON<CartResponse | CartItemDto[]>("/api/cart");
  if (Array.isArray(raw)) {
    return { items: raw };
  }
  return { items: raw.items ?? [] };
}

/** 장바구니에 상품 추가 */
export async function addCartItem(body: {
  itemId: string;
  quantity: number;
  title?: string;
  price?: number;
  image?: string;
}): Promise<CartResponse> {
  const res = await apiClient("/api/cart/items", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "장바구니 담기에 실패했습니다.");
  }
  const raw = await res.json();
  if (Array.isArray(raw)) return { items: raw };
  return { items: raw.items ?? [] };
}

/** 장바구니 수량 변경 */
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartResponse> {
  const res = await apiClient(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    throw new Error(result.message || "수량 변경에 실패했습니다.");
  }
  const raw = await res.json();
  if (Array.isArray(raw)) return { items: raw };
  return { items: raw.items ?? [] };
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
  if (Array.isArray(raw)) return { items: raw };
  return { items: raw.items ?? [] };
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
