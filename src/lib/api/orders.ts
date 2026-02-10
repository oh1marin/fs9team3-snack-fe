import { fetchJSON, apiClient } from "./apiClient";

export type OrderStatus = "승인 대기" | "구매 반려" | "승인 완료";

export interface Order {
  id: string;
  requestDate: string;
  productLabel: string;
  otherCount: number;
  totalQuantity: number;
  orderAmount: number;
  status: OrderStatus;
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
  return {
    id: String(o.id ?? ""),
    requestDate: String(o.request_date ?? o.requestDate ?? ""),
    productLabel: String(o.product_label ?? o.productLabel ?? ""),
    otherCount: Number(o.other_count ?? o.otherCount ?? 0),
    totalQuantity: Number(o.total_quantity ?? o.totalQuantity ?? 0),
    orderAmount: Number(o.order_amount ?? o.orderAmount ?? 0),
    status: (o.status as Order["status"]) ?? "승인 대기",
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

/** 구매 요청 생성 (장바구니에서 요청) */
export async function createOrder(body: {
  items: Array<{ id: string; title: string; quantity: number; price: number; image?: string }>;
  totalQuantity: number;
  totalAmount: number;
  message?: string;
}): Promise<Order> {
  const response = await apiClient("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "구매 요청에 실패했습니다.");
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
    status: (d.status as OrderDetail["status"]) ?? "승인 대기",
    resultMessage: String(d.result_message ?? d.resultMessage ?? ""),
    items: Array.isArray(d.items)
      ? d.items.map((it: Record<string, unknown>) => ({
          image: String(it.image ?? ""),
          category: String(it.category ?? ""),
          name: String(it.name ?? it.title ?? ""),
          unitPrice: Number(it.unit_price ?? it.unitPrice ?? 0),
          quantity: Number(it.quantity ?? 0),
          totalPrice: Number(it.total_price ?? it.totalPrice ?? 0),
        }))
      : [],
    totalCount: Number(d.total_count ?? d.totalCount ?? 0),
    totalAmount: Number(d.total_amount ?? d.totalAmount ?? 0),
  };
}
