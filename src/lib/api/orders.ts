import { fetchJSON, apiClient } from "./apiClient";

export type OrderStatus = "승인 대기" | "구매 반려" | "승인 완료";

// BE Prisma: status = pending | approved | canceled (canceled = 반려)
const STATUS_MAP: Record<string, OrderStatus> = {
  pending: "승인 대기",
  approved: "승인 완료",
  rejected: "구매 반려",
  cancelled: "구매 반려",
  canceled: "구매 반려",
  대기: "승인 대기",
  완료: "승인 완료",
  반려: "구매 반려",
};

function normalizeStatus(s: unknown): OrderStatus {
  const key = String(s ?? "").toLowerCase().trim();
  return STATUS_MAP[key] ?? (s as OrderStatus) ?? "승인 대기";
}

/** summary_title 표시용: " 및 N개" → " 외 N건" */
export function formatSummaryTitle(label: string): string {
  if (!label || !label.trim()) return label;
  return label.replace(/ 및 (\d+)개$/, " 외 $1건");
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
  approvedAt?: string;
  productLabel: string;
  otherCount: number;
  totalQuantity: number;
  orderAmount: number;
  status: OrderStatus;
  requester?: string;
  approver?: string;
  /** 목록에서 썸네일로 쓸 대표 이미지 (BE가 first_item_image 등으로 보내면 표시) */
  image?: string;
  /** 목록 첫 품목의 카테고리 (BE가 items[0].category 등으로 보내면 표시) */
  firstItemCategory?: string;
  /** 관리자 즉시 구매 여부 (BE: is_instant_purchase, purchase_type === 'instant' 등) */
  isInstantPurchase?: boolean;
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

/** items 배열에서 총 수량 합산 */
function sumQuantity(items: unknown[]): number {
  return items.reduce<number>((sum, it) => {
    const r = it as Record<string, unknown>;
    return sum + (Number(r?.quantity ?? 0) || 0);
  }, 0);
}

/**
 * items 배열에서 summary_title 규칙으로 대표 상품명 생성
 * - 0개: ""
 * - 1종류: 상품명만 (예: "코카콜라 제로")
 * - 2종류 이상: "첫상품명 및 N개" (N = 품목 종류 수 - 1, 예: "코카콜라 제로 및 1개")
 */
function buildSummaryFromItems(items: unknown[]): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  const first = items[0] as Record<string, unknown>;
  const sub = (first?.item ?? first?.product) as Record<string, unknown> | undefined;
  const title = String(first?.title ?? first?.name ?? sub?.title ?? sub?.name ?? "").trim();
  if (!title) return "";
  if (items.length === 1) return title;
  return `${title} 및 ${items.length - 1}개`;
}

/** BE가 보내는 snake_case → FE용 camelCase (목록/상세 공통) */
function toOrder(o: Record<string, unknown>): Order {
  const itemsArr = o.items ?? o.order_items;
  const itemsList = Array.isArray(itemsArr) ? itemsArr : [];
  const firstItem = itemsList.length > 0 ? (itemsList[0] as Record<string, unknown>) : null;
  const image = String(
    o.first_item_image ?? o.image ?? o.image_url
    ?? firstItem?.image ?? firstItem?.image_url
    ?? ""
  ).trim();
  const rawStatus = o.status ?? o.order_status;
  const firstItemCategory = firstItem
    ? String(firstItem.category ?? firstItem.category_sub ?? "").trim()
    : "";
  const totalQuantityFromItems = sumQuantity(itemsList);
  const totalQuantity = Number(o.total_quantity ?? o.totalQuantity ?? 0) || totalQuantityFromItems;
  const productLabelRaw = String(
    o.summary_title ?? o.summaryTitle ?? o.product_label ?? o.productLabel ?? o.product_summary ?? ""
  ).trim();
  const productLabel = productLabelRaw || buildSummaryFromItems(itemsList);
  return {
    id: String(o.id ?? ""),
    requestDate: String(o.request_date ?? o.requestDate ?? o.created_at ?? o.createdAt ?? ""),
    approvedAt: String(o.approved_at ?? o.approval_date ?? o.approvedAt ?? o.approvalDate ?? "").trim() || undefined,
    productLabel,
    otherCount: Number(o.other_count ?? o.otherCount ?? 0),
    totalQuantity,
    orderAmount: Number(o.order_amount ?? o.total_amount ?? o.orderAmount ?? o.totalAmount ?? 0),
    status: normalizeStatus(rawStatus),
    requester: String(o.requester ?? o.request_user_name ?? o.requested_by ?? "").trim() || undefined,
    approver: String(o.approver ?? o.approver_name ?? o.approved_by ?? "").trim() || undefined,
    ...(image && { image }),
    ...(firstItemCategory && { firstItemCategory }),
    ...(o.is_instant_purchase === true || o.is_instant_purchase === "Y" || o.is_instant_purchase === "true" || o.isInstantPurchase === true || o.isInstantPurchase === "Y" || o.purchase_type === "instant" ? { isInstantPurchase: true } : {}),
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
  const raw = await fetchJSON<{ data?: unknown[]; orders?: unknown[]; pagination?: Record<string, unknown> } | unknown[]>(
    `/api/orders${q ? `?${q}` : ""}`
  );
  const arrSafe = getOrdersArray(raw);
  const pag = Array.isArray(raw) ? undefined : raw && typeof raw === "object" ? (raw as Record<string, unknown>).pagination as Record<string, unknown> | undefined : undefined;
  return {
    data: arrSafe.map((item) => toOrder((item as Record<string, unknown>) ?? {})),
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

/** 응답에서 주문 배열 추출 (data / orders / result / list 또는 중첩 data.orders 등) */
function getOrdersArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const data = o.data ?? o.orders ?? o.result ?? o.list;
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).orders ?? (data as Record<string, unknown>).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

/** 관리자: 구매 요청 목록 (GET /api/admin/orders). status 있으면 해당 상태만 조회 (예: pending) */
export async function fetchAdminOrders(params?: {
  page?: number;
  limit?: number;
  sort?: string;
  /** 미지정 시 BE 기본값. 구매 요청 관리에서는 pending만 보려면 'pending' 전달 */
  status?: string;
}): Promise<OrdersListResponse> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.sort) search.set("sort", params.sort);
  if (params?.status) search.set("status", params.status);
  const q = search.toString();
  const raw = await fetchJSON<{ data?: unknown[]; orders?: unknown[]; pagination?: Record<string, unknown> } | unknown[]>(
    `/api/admin/orders${q ? `?${q}` : ""}`
  );
  const arrSafe = getOrdersArray(raw);
  const pag = Array.isArray(raw) ? undefined : raw && typeof raw === "object" ? (raw as Record<string, unknown>).pagination as Record<string, unknown> | undefined : undefined;
  return {
    data: arrSafe.map((item) => toOrder((item as Record<string, unknown>) ?? {})),
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

/** 관리자: 주문 승인/반려 (PATCH /api/admin/orders/:id, status: approved | cancelled) */
export async function updateAdminOrderStatus(
  orderId: string,
  status: "approved" | "cancelled",
  options?: { resultMessage?: string }
): Promise<Order> {
  const body: Record<string, unknown> = { status };
  if (options?.resultMessage != null && options.resultMessage.trim() !== "") {
    body.result_message = options.resultMessage.trim();
  }
  const response = await apiClient(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || result.error || (status === "cancelled" ? "반려에 실패했습니다." : "승인에 실패했습니다."));
  }
  const res = await response.json();
  const o = res?.data ?? res;
  return toOrder(o ?? {});
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

/** 장바구니 전체로 주문 (BE가 해당 유저 장바구니 전부로 주문 생성 후 카트에서 삭제) */
export async function createOrderFromCart(options?: { instant_purchase?: boolean }): Promise<Order> {
  const body = options?.instant_purchase === true ? { instant_purchase: true } : {};
  const response = await apiClient("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
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
  /** 관리자 즉시 구매 시 true (BE에서 관리자만 허용) */
  instant_purchase?: boolean;
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
    ...(body.instant_purchase === true && { instant_purchase: true }),
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
  itemId: string;
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
  /** BE summary_title (예: "코카콜라 제로 및 1개") */
  summaryTitle?: string;
  /** 관리자 즉시 구매 여부 */
  isInstantPurchase?: boolean;
}

/** 주문 상세를 OrderDetail 형식으로 파싱 (공통) */
function parseOrderDetailToResponse(d: Record<string, unknown>): OrderDetail {
  return {
    id: String(d.id ?? ""),
    requestDate: String(d.request_date ?? d.requestDate ?? ""),
    requestMessage: String(d.request_message ?? d.requestMessage ?? ""),
    requester: String(d.requester ?? d.request_user_name ?? d.requested_by ?? "").trim(),
    approvalDate: String(d.approval_date ?? d.approvalDate ?? ""),
    approver: String(d.approver ?? ""),
    status: normalizeStatus(d.status),
    resultMessage: String(d.result_message ?? d.resultMessage ?? ""),
    items: Array.isArray(d.items)
      ? (d.items as Record<string, unknown>[]).map((it) => {
          const sub = (it.item ?? it.product) as Record<string, unknown> | undefined;
          const itemId = String(it.item_id ?? it.itemId ?? sub?.id ?? "").trim();
          return {
            itemId: itemId || String(it.id ?? ""),
            image: String(it.image ?? it.image_url ?? it.img ?? sub?.image ?? sub?.image_url ?? "").trim(),
            category: String(it.category ?? it.category_sub ?? sub?.category_sub ?? sub?.category ?? ""),
            name: String(it.name ?? it.title ?? sub?.title ?? sub?.name ?? ""),
            unitPrice: Number(it.unit_price ?? it.unitPrice ?? sub?.price ?? 0),
            quantity: Number(it.quantity ?? 0),
            totalPrice: Number(it.total_price ?? it.totalPrice ?? 0),
          };
        })
      : [],
    totalCount: Number(d.total_count ?? d.totalCount ?? 0) || (Array.isArray(d.items) ? d.items.length : 0),
    totalAmount: Number(d.total_amount ?? d.totalAmount ?? 0),
    summaryTitle: d.summary_title != null ? String(d.summary_title) : undefined,
    isInstantPurchase: d.is_instant_purchase === true || d.is_instant_purchase === "Y" || d.is_instant_purchase === "true" || d.isInstantPurchase === true || d.isInstantPurchase === "Y" || d.purchase_type === "instant",
  };
}

/** 구매 요청 상세 조회 (일반 유저용 - 본인 주문만) */
export async function fetchOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const response = await apiClient(`/api/orders/${orderId}`, { method: "GET" });
  if (!response.ok) return null;
  const data = await response.json();
  const d = data?.data ?? data;
  if (!d?.id) return null;
  return parseOrderDetailToResponse(d as Record<string, unknown>);
}

/** 관리자용 주문 상세 조회 (모든 사용자 주문 조회 가능) */
export async function fetchOrderDetailAdmin(orderId: string): Promise<OrderDetail | null> {
  const response = await apiClient(`/api/admin/orders/${orderId}`, { method: "GET" });
  if (!response.ok) return null;
  const data = await response.json();
  const d = data?.data ?? data;
  if (!d?.id) return null;
  return parseOrderDetailToResponse(d as Record<string, unknown>);
}

