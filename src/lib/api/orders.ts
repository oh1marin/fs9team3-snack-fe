import { fetchJSON, apiClient } from "./apiClient";

export type OrderStatus = "승인 대기" | "구매 반려" | "승인 완료";

// BE Prisma: status = pending | approved | cancelled (cancelled = 반려)
const STATUS_MAP: Record<string, OrderStatus> = {
  pending: "승인 대기",
  approved: "승인 완료",
  rejected: "구매 반려",
  cancelled: "구매 반려",
  대기: "승인 대기",
  완료: "승인 완료",
  반려: "구매 반려",
};

function normalizeStatus(s: unknown): OrderStatus {
  const key = String(s ?? "").toLowerCase().trim();
  return STATUS_MAP[key] ?? (s as OrderStatus) ?? "승인 대기";
}

/** ISO 날짜/문자열 → "YYYY.MM.DD" 형태로 표시용 */
export function formatRequestDate(value: string): string {
  if (!value || !value.trim()) return "—";
  const d = new Date(value.trim());
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export interface Order {
  id: string;
  requestDate: string;
  productLabel: string;
  otherCount: number;
  totalQuantity: number;
  orderAmount: number;
  status: OrderStatus;
  /** 목록에서 썸네일로 쓸 대표 이미지 (BE가 first_item_image 등으로 보내면 표시) */
  image?: string;
  /** 목록 첫 품목의 카테고리 (BE가 items[0].category 등으로 보내면 표시) */
  firstItemCategory?: string;
}

export interface OrdersListResponse {
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

/** BE가 보내는 snake_case → FE용 camelCase (목록/상세 공통) */
function toOrder(o: Record<string, unknown>): Order {
  const itemsArr = o.items ?? o.order_items;
  const firstItem = Array.isArray(itemsArr) && itemsArr.length > 0 ? (itemsArr[0] as Record<string, unknown>) : null;
  const image = String(
    o.first_item_image ?? o.image ?? o.image_url
    ?? firstItem?.image ?? firstItem?.image_url
    ?? ""
  ).trim();
  const rawStatus = o.status ?? o.order_status;
  const firstItemCategory = firstItem
    ? String(firstItem.category ?? firstItem.category_sub ?? "").trim()
    : "";
  return {
    id: String(o.id ?? ""),
    requestDate: String(o.request_date ?? o.requestDate ?? o.created_at ?? o.createdAt ?? ""),
    productLabel: String(o.product_label ?? o.productLabel ?? ""),
    otherCount: Number(o.other_count ?? o.otherCount ?? 0),
    totalQuantity: Number(o.total_quantity ?? o.totalQuantity ?? 0),
    orderAmount: Number(o.order_amount ?? o.total_amount ?? o.orderAmount ?? o.totalAmount ?? 0),
    status: normalizeStatus(rawStatus),
    ...(image && { image }),
    ...(firstItemCategory && { firstItemCategory }),
  };
}

/** 구매 요청 내역 목록 조회 (BE: snake_case → FE: camelCase) */
export async function fetchOrders(params?: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<OrdersListResponse> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.sort) search.set("sort", params.sort);
  const q = search.toString();
  const raw = await fetchJSON<{ data?: unknown[]; pagination?: Record<string, unknown> } | unknown[]>(
    `/api/orders${q ? `?${q}` : ""}`
  );
  const arr = Array.isArray(raw) ? raw : raw?.data ?? [];
  const pag = Array.isArray(raw) ? undefined : raw?.pagination;
  return {
    data: arr.map((item) => toOrder((item as Record<string, unknown>) ?? {})),
    pagination: pag
      ? {
          page: Number(pag.page ?? 1),
          limit: Number(pag.limit ?? 10),
          totalCount: Number(pag.total_count ?? pag.totalCount ?? 0),
          totalPages: Number(pag.total_pages ?? pag.totalPages ?? 1),
        }
      : undefined,
  };
}

/** 구매 요청 시 FE가 넘기는 상품 한 줄 (itemId 있으면 주문 시 item_id로 전송) */
export interface CreateOrderItem {
  id: string;
  itemId?: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

/** 장바구니 전체로 주문 (body 없음 → BE가 해당 유저 장바구니 전부로 주문 생성 후 카트에서 삭제) */
export async function createOrderFromCart(): Promise<Order> {
  const response = await apiClient("/api/orders", {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || result.error || "구매 요청에 실패했습니다.");
  }
  const res = await response.json();
  const o = res?.data ?? res;
  return toOrder(o ?? {});
}

/** 구매 요청 생성 — 선택 품목만 보낼 때 (BE는 snake_case 요구) */
export async function createOrder(body: {
  items: CreateOrderItem[];
  totalQuantity: number;
  totalAmount: number;
  message?: string;
}): Promise<Order> {
  const payload = {
    items: body.items.map((it) => ({
      item_id: String(it.itemId ?? it.id),
      title: it.title,
      quantity: Number(it.quantity),
      price: Number(it.price),
      ...(it.image != null && { image: it.image }),
    })),
    total_quantity: Number(body.totalQuantity),
    total_amount: Number(body.totalAmount),
    ...(body.message != null && body.message !== "" && { request_message: body.message }),
  };
  const response = await apiClient("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || result.error || "구매 요청에 실패했습니다.");
  }
  const res = await response.json();
  const o = res?.data ?? res;
  return toOrder(o ?? {});
}

/** 구매 요청 취소 */
export async function cancelOrder(orderId: string): Promise<void> {
  const response = await apiClient(`/api/orders/${orderId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "요청 취소에 실패했습니다.");
  }
}

export interface OrderDetailItem {
  image: string;
  category: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderDetail {
  id: string;
  requestDate: string;
  requestMessage: string;
  requester: string;
  approvalDate: string;
  approver: string;
  status: OrderStatus;
  resultMessage: string;
  items: OrderDetailItem[];
  totalCount: number;
  totalAmount: number;
}

/** 구매 요청 상세 조회 (BE: snake_case → FE: camelCase) */
export async function fetchOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const response = await apiClient(`/api/orders/${orderId}`, { method: "GET" });
  if (!response.ok) return null;
  const data = await response.json();
  const d = data?.data ?? data;
  if (!d?.id) return null;
  return {
    id: String(d.id),
    requestDate: String(d.request_date ?? d.requestDate ?? ""),
    requestMessage: String(d.request_message ?? d.requestMessage ?? ""),
    requester: String(d.requester ?? ""),
    approvalDate: String(d.approval_date ?? d.approvalDate ?? ""),
    approver: String(d.approver ?? ""),
    status: normalizeStatus(d.status),
    resultMessage: String(d.result_message ?? d.resultMessage ?? ""),
    items: Array.isArray(d.items)
      ? d.items.map((it: Record<string, unknown>) => {
          const sub = (it.item ?? it.product) as Record<string, unknown> | undefined;
          return {
          image: String(it.image ?? it.image_url ?? it.img ?? sub?.image ?? sub?.image_url ?? "").trim(),
          category: String(it.category ?? ""),
          name: String(it.name ?? it.title ?? ""),
          unitPrice: Number(it.unit_price ?? it.unitPrice ?? 0),
          quantity: Number(it.quantity ?? 0),
          totalPrice: Number(it.total_price ?? it.totalPrice ?? 0),
        };
        })
      : [],
    totalCount: Number(d.total_count ?? d.totalCount ?? 0) || (Array.isArray(d.items) ? d.items.length : 0),
    totalAmount: Number(d.total_amount ?? d.totalAmount ?? 0),
  };
}
