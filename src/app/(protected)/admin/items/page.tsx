"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { fetchRegisteredItems, type RegisteredItem } from "@/lib/api/items";
import { getImageSrc } from "@/lib/utils/image";

type SortOption = "최신순" | "낮은가격순" | "높은가격순";

const SORT_MAP: Record<SortOption, string> = {
  최신순: "create_at:desc",
  낮은가격순: "price:asc",
  높은가격순: "price:desc",
};

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

function displayLink(link: string | null): string {
  if (!link || !link.trim()) return "—";
  const url = link.startsWith("http") ? link : `https://${link.replace(/^\/\//, "")}`;
  try {
    const host = new URL(url).hostname;
    return host.length > 20 ? `${host.slice(0, 17)}...` : host;
  } catch {
    return link.length > 24 ? `${link.slice(0, 21)}...` : link;
  }
}

export default function AdminItemsPage() {
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
      });
      setItems(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch {
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortOption]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 ml-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0">
        <h1 className="text-2xl font-bold text-black-400">
          상품 등록 내역
        </h1>
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
              className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
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
                {(["최신순", "낮은가격순", "높은가격순"] as const).map((opt) => (
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
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="ml-[clamp(2rem,8.33vw,10rem)] mr-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0 max-[1100px]:mr-0">
        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-line-gray bg-white">
            <p className="text-gray-500">불러오는 중...</p>
          </div>
        ) : (
          <div
            className="min-w-[820px] overflow-x-auto"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1.2fr 1fr 1.2fr",
            }}
          >
            <div
              className="flex h-20 items-center justify-center rounded-l-[100px] border-b border-l border-t border-gray-200 bg-white pl-5 text-center text-base font-semibold text-black-400"
              style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
            >
              등록일
            </div>
            <div
              className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
              style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
            >
              상품명
            </div>
            <div
              className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
              style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
            >
              카테고리
            </div>
            <div
              className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
              style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
            >
              가격
            </div>
            <div
              className="flex h-20 items-center justify-center rounded-r-[100px] border-b border-r border-t border-gray-200 bg-white pr-5 text-center text-base font-semibold text-black-400"
              style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
            >
              제품 링크
            </div>

            {items.map((row) => (
              <Fragment key={row.id}>
                <div
                  className="flex h-20 items-center border-b border-line-gray pl-5 text-center text-base text-black-400"
                >
                  {row.createAt}
                </div>
                <div className="flex h-20 items-center gap-3 border-b border-line-gray pl-3 text-left text-base">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {row.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getImageSrc(row.image)}
                        alt={row.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-black-400 truncate">{row.title || "—"}</p>
                </div>
                <div className="flex h-20 items-center border-b border-line-gray px-2 text-center text-base text-black-400">
                  {row.categorySub || row.categoryMain || "—"}
                </div>
                <div className="flex h-20 items-center justify-center border-b border-line-gray text-center text-base text-black-400">
                  {formatPrice(row.price)}
                </div>
                <div className="flex h-20 items-center justify-center border-b border-line-gray pr-5 text-center text-base">
                  {row.link ? (
                    <a
                      href={row.link.startsWith("http") ? row.link : `https://${row.link.replace(/^\/\//, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary-400 hover:underline"
                    >
                      <span className="truncate max-w-[140px]">{displayLink(row.link)}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
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
            className="flex h-11 w-11 items-center justify-center rounded text-base font-normal text-black-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          {Array.from({ length: Math.min(totalPages, 9) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCurrentPage(n)}
              className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded px-2.5 text-base ${
                currentPage === n
                  ? "font-bold text-black-400"
                  : "font-normal text-black-400 hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          ))}
          {totalPages > 9 && (
            <>
              <span className="px-1 text-gray-400">...</span>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                className="flex h-11 min-w-[2.75rem] items-center justify-center rounded px-2.5 text-base font-normal text-black-400 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-11 w-11 items-center justify-center rounded text-base font-normal text-black-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      )}
    </main>
  );
}
