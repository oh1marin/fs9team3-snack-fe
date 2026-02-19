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

/** 장바구니 예산 (관리자/최고관리자만 응답에 포함) */
export interface CartBudget {
  budget_amount: number;
  spent_amount: number;
  remaining: number;
  initial_budget: number;
}

export interface CartResponse {
  items: CartItemDto[];
  total_amount?: number;
  shipping_fee?: number;
  budget?: CartBudget;
}

/** BE 응답 한 줄을 id/title/price/image/quantity(camelCase)로 통일. price는 반드시 단가(unit). total_price만 오면 단가 = total_price/quantity */
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
  const quantity = Number(d.quantity ?? 1) || 1;
  const totalPrice = Number(d.total_price ?? itemObj?.total_price ?? 0);
  const unitFromApi = Number(d.price ?? d.unit_price ?? itemObj?.price ?? itemObj?.unit_price ?? 0);
  const price =
    unitFromApi > 0
      ? unitFromApi
      : totalPrice > 0 && quantity > 0
        ? Math.round(totalPrice / quantity)
        : 0;
  return {
    id: id || itemId,
    itemId: itemId || id,
    title: title || "상품",
    price,
    image,
    quantity,
  };
}

function parseNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function toCartBudget(b: Record<string, unknown> | null | undefined): CartBudget | undefined {
  if (!b || typeof b !== "object") return undefined;
  const budgetAmount = parseNum(b.budget_amount ?? b.budgetAmount);
  const spentAmount = parseNum(b.spent_amount ?? b.spentAmount);
  const rawRemaining = b.remaining ?? b.remainingBudget ?? b.remaining_amount ?? b.remainingAmount;
  // BE가 remaining 미포함 시 budget_amount - spent_amount로 계산
  const parsedRemaining = parseNum(rawRemaining);
  const calculatedRemaining = Math.max(0, budgetAmount - spentAmount);
  const remaining =
    rawRemaining !== undefined && rawRemaining !== null && parsedRemaining > 0
      ? parsedRemaining
      : budgetAmount > 0 || spentAmount > 0
        ? calculatedRemaining
        : parsedRemaining;
  const initialBudget = parseNum(b.initial_budget ?? b.initialBudget) || budgetAmount;
  return {
    budget_amount: budgetAmount,
    spent_amount: spentAmount,
    remaining: Math.max(0, remaining),
    initial_budget: initialBudget,
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
  const items = arr.map((x) => toCartItemDto((x as Record<string, unknown>) ?? {}));
  const budgetRaw = obj.budget;
  const budget = budgetRaw && typeof budgetRaw === "object" ? toCartBudget(budgetRaw as Record<string, unknown>) : undefined;
  return {
    items,
    total_amount: typeof obj.total_amount === "number" ? obj.total_amount : undefined,
    shipping_fee: typeof obj.shipping_fee === "number" ? obj.shipping_fee : undefined,
    budget,
  };
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
