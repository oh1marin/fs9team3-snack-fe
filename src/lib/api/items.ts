import { fetchJSON } from "./apiClient";

export interface RegisteredItem {
  id: string;
  title: string;
  price: number;
  image: string;
  categoryMain: string;
  categorySub: string;
  createAt: string;
  link: string | null;
}

export interface ItemsListResponse {
  data: RegisteredItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

/** 등록일 포맷 (YYYY. MM. DD) */
function formatCreateAt(value: string): string {
  if (!value || !value.trim()) return "—";
  const d = new Date(value.trim());
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${day}`;
}

function toRegisteredItem(raw: Record<string, unknown>): RegisteredItem {
  const createAt = String(raw.create_at ?? raw.createAt ?? "").trim();
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? "").trim(),
    price: Number(raw.price ?? 0),
    image: String(raw.image ?? "").trim(),
    categoryMain: String(raw.category_main ?? raw.categoryMain ?? "").trim(),
    categorySub: String(raw.category_sub ?? raw.categorySub ?? "").trim(),
    createAt: createAt ? formatCreateAt(createAt) : "—",
    link: raw.link != null && raw.link !== "" ? String(raw.link).trim() : null,
  };
}

/** 상품 등록 내역 목록 (GET /api/items) - 관리자용 */
export async function fetchRegisteredItems(params?: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<ItemsListResponse> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.sort) search.set("sort", params.sort);
  const q = search.toString();
  const raw = await fetchJSON<{ data?: unknown[]; pagination?: Record<string, unknown> } | unknown[]>(
    `/api/items${q ? `?${q}` : ""}`
  );
  const dataArr = Array.isArray(raw) ? raw : (raw && typeof raw === "object" && (raw as Record<string, unknown>).data) ?? [];
  const arr = Array.isArray(dataArr) ? dataArr : [];
  const pag = Array.isArray(raw) ? undefined : raw && typeof raw === "object" ? (raw as Record<string, unknown>).pagination as Record<string, unknown> | undefined : undefined;
  return {
    data: arr.map((item) => toRegisteredItem((item as Record<string, unknown>) ?? {})),
    pagination: {
      page: Number(pag?.page ?? 1),
      limit: Number(pag?.limit ?? 10),
      totalCount: Number(pag?.totalCount ?? pag?.total_count ?? 0),
      totalPages: Number(pag?.totalPages ?? pag?.total_pages ?? 1),
    },
  };
}
