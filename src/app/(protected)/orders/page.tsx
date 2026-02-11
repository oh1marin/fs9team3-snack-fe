"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchOrders, cancelOrder, formatRequestDate, formatSummaryTitle, type Order } from "@/lib/api/orders";
import { toast } from "react-toastify";
import { getImageSrc } from "@/lib/utils/image";

type SortOption = "최신순" | "낮은 금액순" | "높은 금액순";

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}


/** BE 정렬 파라미터는 snake_case로 전달 */
const SORT_MAP: Record<SortOption, string> = {
  최신순: "request_date:desc",
  "낮은 금액순": "order_amount:asc",
  "높은 금액순": "order_amount:desc",
};

export default function OrdersPage() {
  const [sortOption, setSortOption] = useState<SortOption>("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrders({
        page: currentPage,
        limit: 10,
        sort: SORT_MAP[sortOption],
      });
      const apiOrders = res.data ?? [];
      setOrders(apiOrders);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch {
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortOption]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelOrder(id);
      toast.success("요청이 취소되었습니다.");
      // 서버 반영 후 목록을 다시 맞추기(페이지/정렬/총페이지 동기화)
      loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "요청 취소에 실패했습니다.");
    }
  };

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 ml-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0">
        <h1 className="text-2xl font-bold text-black-400">
          구매 요청 내역
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
                {(["최신순", "낮은 금액순", "높은 금액순"] as const).map((opt) => (
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
            gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
          }}
        >
          {/* 제목 행: pill 테두리, 높이 80px */}
          <div
            className="flex h-20 items-center justify-center rounded-l-[100px] border-b border-l border-t border-gray-200 bg-white pl-5 text-center text-base font-semibold text-black-400"
            style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
          >
            구매요청일
          </div>
          <div
            className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
            style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
          >
            상품정보
          </div>
          <div
            className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
            style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
          >
            주문 금액
          </div>
          <div
            className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
            style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
          >
            상태
          </div>
          <div
            className="flex h-20 items-center justify-center rounded-r-[100px] border-b border-r border-t border-gray-200 bg-white pr-5 text-center text-base font-semibold text-black-400"
            style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
          >
            비고
          </div>
          {/* 본문: 구분선만, 높이 80px - 행 클릭 시 상세로 이동 */}
          {orders.flatMap((row) => [
            <Link
              key={`${row.id}-1`}
              href={`/orders/${row.id}`}
              className="flex h-20 items-center border-b border-line-gray pl-5 text-center text-base text-black-400 hover:bg-gray-50"
            >
              {formatRequestDate(row.requestDate)}
            </Link>,
            <Link
              key={`${row.id}-2`}
              href={`/orders/${row.id}`}
              className="flex h-20 items-center gap-3 border-b border-line-gray pl-3 text-left text-base hover:bg-gray-50"
            >
              <div className="h-14 w-14 shrink-0 min-[1082px]:hidden">
                {row.image ? (
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageSrc(row.image)}
                      alt={row.productLabel}
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                    이미지 없음
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-black-400">
                  {row.productLabel ? `상품이름: ${formatSummaryTitle(row.productLabel)}` : "—"}
                </p>
                <p className="mt-1 text-gray-500">
                  총 수량: {row.totalQuantity}개
                </p>
              </div>
            </Link>,
            <Link
              key={`${row.id}-3`}
              href={`/orders/${row.id}`}
              className="flex h-20 items-center justify-center border-b border-line-gray text-center text-base text-black-400 hover:bg-gray-50"
            >
              {formatAmount(row.orderAmount)}원
            </Link>,
            <Link
              key={`${row.id}-4`}
              href={`/orders/${row.id}`}
              className="flex h-20 items-center justify-center border-b border-line-gray text-center text-base text-black-400 hover:bg-gray-50"
            >
              {row.status}
            </Link>,
            <div
              key={`${row.id}-5`}
              className="flex h-20 items-center justify-center border-b border-line-gray pr-5 text-center text-base"
              onClick={(e) => e.preventDefault()}
            >
              {row.status === "승인 대기" ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelRequest(row.id);
                  }}
                  className="rounded border border-primary-400 bg-white px-4 py-2.5 font-medium text-primary-400 transition-colors hover:bg-primary-50"
                >
                  요청 취소
                </button>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>,
          ])}
        </div>
        )}
      </div>

      {!loading && orders.length > 0 && totalPages >= 1 && (
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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
