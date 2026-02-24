"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { fetchRegisteredItems, type RegisteredItem } from "@/lib/api/items";
import { getImageSrc } from "@/lib/utils/image";
import { useAuth } from "@/contexts/AuthContext";

type SortOption = "최신순" | "낮은가격순" | "높은가격순";

const SORT_MAP: Record<SortOption, string> = {
  최신순: "create_at:desc",
  낮은가격순: "price:asc",
  높은가격순: "price:desc",
};

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

const DEFAULT_LINK = "https://www.codeit.com";

function displayLink(link: string | null, useDefault = false): string {
  const resolved =
    useDefault && (!link || !link.trim()) ? DEFAULT_LINK : (link || "").trim();
  if (!resolved) return "—";
  const url = resolved.startsWith("http")
    ? resolved
    : `https://${resolved.replace(/^\/\//, "")}`;
  try {
    const host = new URL(url).hostname;
    return host.length > 20 ? `${host.slice(0, 17)}...` : host;
  } catch {
    return resolved.length > 24 ? `${resolved.slice(0, 21)}...` : resolved;
  }
}

function resolveLink(link: string | null): string {
  if (link && link.trim()) {
    return link.startsWith("http")
      ? link
      : `https://${link.replace(/^\/\//, "")}`;
  }
  return DEFAULT_LINK;
}

export default function AdminItemsPage() {
  const { user } = useAuth();

  const rawAdmin =
    user?.is_admin ?? (user as { isAdmin?: string | boolean })?.isAdmin;

  const isAdmin =
    rawAdmin === "Y" ||
    rawAdmin === "y" ||
    rawAdmin === true ||
    String(rawAdmin ?? "").toLowerCase() === "true";

  const [sortOption, setSortOption] = useState<SortOption>("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<RegisteredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchRegisteredItems({
        page: currentPage,
        limit: 10,
        sort: SORT_MAP[sortOption],
        mine: !isAdmin,
      });

      let list = res.data ?? [];

      if (!isAdmin && user?.id) {
        const hasCreatorInfo = list.some((i) => i.createdByUserId != null);
        if (hasCreatorInfo) {
          list = list.filter((i) => i.createdByUserId === user.id);
        }
      }

      setItems(list);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch {
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortOption, isAdmin, user?.id]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 ml-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0">
        <h1 className="text-2xl font-bold text-black-400">상품 등록 내역</h1>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortDropdown((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg border border-line-gray bg-white px-5 py-3.5 text-base font-medium text-black-400"
          >
            {sortOption}
            <svg
              width="16"
              height="16"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform ${
                showSortDropdown ? "rotate-180" : ""
              }`}
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="#999"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setShowSortDropdown(false)}
              />
              <ul className="absolute right-0 top-full z-20 mt-1.5 min-w-[182px] rounded-lg border border-line-gray bg-white py-1.5 shadow-lg">
                {(["최신순", "낮은가격순", "높은가격순"] as const).map(
                  (opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortOption(opt);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-5 py-3.5 text-left text-base ${
                          sortOption === opt
                            ? "bg-primary-50 font-medium text-primary-400"
                            : "text-black-400 hover:bg-gray-50"
                        }`}
                      >
                        {opt}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="ml-[clamp(2rem,8.33vw,10rem)] mr-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0 max-[1100px]:mr-0">
        {loading ? (
          <div className="min-h-[200px] animate-pulse rounded-lg border border-line-gray bg-gray-200/50" />
        ) : (
          <div
            className="min-w-[820px] overflow-x-auto"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1.2fr 1fr 1.2fr",
            }}
          >
            <div className="flex h-20 items-center justify-center rounded-l-[100px] border-b border-l border-t border-gray-200 bg-white pl-5 text-base font-semibold text-black-400">
              등록일
            </div>
            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-base font-semibold text-black-400">
              상품명
            </div>
            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-base font-semibold text-black-400">
              카테고리
            </div>
            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-base font-semibold text-black-400">
              가격
            </div>
            <div className="flex h-20 items-center justify-center rounded-r-[100px] border-b border-r border-t border-gray-200 bg-white pr-5 text-base font-semibold text-black-400">
              제품 링크
            </div>

            {items.map((row, index) => (
              <Fragment key={row.id}>
                <div className="flex h-20 items-center border-b border-line-gray pl-5 text-base text-black-400">
                  {row.createAt}
                </div>

                <div className="flex h-20 items-center gap-3 border-b border-line-gray pl-3 text-base">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {row.image ? (
                      <Image
                        src={getImageSrc(row.image)}
                        alt={row.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-black-400 truncate">
                    {row.title || "—"}
                  </p>
                </div>

                <div className="flex h-20 items-center border-b border-line-gray px-2 text-base text-black-400">
                  {row.categorySub || row.categoryMain || "—"}
                </div>

                <div className="flex h-20 items-center justify-center border-b border-line-gray text-base text-black-400">
                  {formatPrice(row.price)}
                </div>

                <div className="flex h-20 items-center justify-center border-b border-line-gray pr-5 text-base">
                  <a
                    href={resolveLink(row.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary-400 hover:underline"
                  >
                    <span className="truncate max-w-[140px]">
                      {displayLink(row.link, true)}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              </Fragment>
            ))}
          </div>
        )}
      </div>

      {!loading && items.length > 0 && totalPages >= 1 && (
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex h-11 w-11 items-center justify-center rounded text-base text-black-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>

          {Array.from({ length: Math.min(totalPages, 9) }, (_, i) => i + 1).map(
            (n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCurrentPage(n)}
                className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded px-2.5 text-base ${
                  currentPage === n
                    ? "font-bold text-black-400"
                    : "text-black-400 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ),
          )}

          {totalPages > 9 && (
            <>
              <span className="px-1 text-gray-400">...</span>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                className="flex h-11 min-w-[2.75rem] items-center justify-center rounded px-2.5 text-base text-black-400 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-11 w-11 items-center justify-center rounded text-base text-black-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      )}
    </main>
  );
}
