"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchAdminOrders,
  formatRequestDate,
  formatSummaryTitle,
  type Order,
} from "@/lib/api/orders";
// import { fetchBudgetCurrentAPI } from "@/lib/api/superAdmin";
import { toast } from "react-toastify";

type SortOption = "최신순" | "낮은 금액순" | "높은 금액순";

const SORT_MAP: Record<SortOption, string> = {
  최신순: "request_date:desc",
  "낮은 금액순": "order_amount:asc",
  "높은 금액순": "order_amount:desc",
};

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}

export default function AdminPurchaseHistoryPage() {
  const [sortOption, setSortOption] = useState<SortOption>("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 예산/연간 지출 연동 기능 - 데이터 불일치 이슈로 주석 처리
  // const [budgetInfo, setBudgetInfo] = useState<{ spent: number; remaining: number } | null>(null);
  // const [yearlySpent, setYearlySpent] = useState<number | null>(null);
  // const loadBudget = useCallback(async () => { ... }, []);
  // const loadYearlySpent = useCallback(async () => { ... }, []);
  // useEffect(() => { loadBudget(); }, [loadBudget]);
  // useEffect(() => { loadYearlySpent(); }, [loadYearlySpent]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({
        page: 1,
        limit: 200,
        sort: SORT_MAP[sortOption],
        status: "approved",
      });
      const list = res.data ?? [];
      setOrders(list);
    } catch (err) {
      setOrders([]);
      toast.error(
        err instanceof Error ? err.message : "구매 내역을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [sortOption]);

  useEffect(() => {
    setCurrentPage(1);
    loadOrders();
  }, [loadOrders]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, currentPage]);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div className="mb-8 ml-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0">
        <h1 className="text-2xl font-bold text-black-400">구매 내역 확인</h1>
      </div>

      <section className="mb-8 ml-[clamp(2rem,8.33vw,10rem)] mr-[clamp(2rem,8.33vw,10rem)] grid grid-cols-1 gap-4 md:grid-cols-3 max-[1100px]:ml-0 max-[1100px]:mr-0">
        <article className="rounded-2xl border border-line-gray bg-white px-6 py-5">
          <p className="text-base font-semibold text-black-400">
            이번 달 지출액
          </p>
          <p className="mt-1 text-sm text-gray-400">
            지난 달보다 2,000,000원 덜 지출했어요
          </p>
          <p className="mt-4 text-[36px] font-bold leading-none text-black-400">
            126,000원
          </p>
        </article>
        <article className="rounded-2xl border border-line-gray bg-white px-6 py-5">
          <p className="text-base font-semibold text-black-400">
            이번 달 남은 예산
          </p>
          <p className="mt-1 text-sm text-gray-400">
            지난 달보다 50,000원 더 담아요
          </p>
          <p className="mt-4 text-[36px] font-bold leading-none text-black-400">
            150,000원
          </p>
        </article>
        <article className="rounded-2xl border border-line-gray bg-white px-6 py-5">
          <p className="text-base font-semibold text-black-400">
            올해 총 지출액
          </p>
          <p className="mt-1 text-sm text-gray-400">
            지난 해보다 1,000,000원 더 지출했어요
          </p>
          <p className="mt-4 text-[36px] font-bold leading-none text-black-400">
            23,000,000원
          </p>
        </article>
      </section>

      <div className="mb-4 ml-[clamp(2rem,8.33vw,10rem)] mr-[clamp(2rem,8.33vw,10rem)] flex justify-end max-[1100px]:ml-0 max-[1100px]:mr-0">
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
                {(["최신순", "낮은 금액순", "높은 금액순"] as const).map(
                  (opt) => (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortOption(opt);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-5 py-3.5 text-left text-base ${sortOption === opt ? "bg-primary-50 font-medium text-primary-400" : "text-black-400 hover:bg-gray-50"}`}
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
        ) : orders.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center py-16">
            <Image src="/sadDog.png" alt="" width={388} height={304} />
          </div>
        ) : (
          <div
            className="min-w-[1020px] overflow-x-auto"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1fr",
            }}
          >
            <div className="flex h-20 items-center justify-center rounded-l-[100px] border-b border-l border-t border-gray-200 bg-white pl-5 text-center text-base font-semibold text-black-400">
              구매승인일
            </div>
            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400">
              상품정보
            </div>
            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400">
              주문 금액
            </div>
            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400">
              요청인
            </div>
            <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400">
              담당자
            </div>
            <div className="flex h-20 items-center justify-center rounded-r-[100px] border-b border-r border-t border-gray-200 bg-white pr-5 text-center text-base font-semibold text-black-400">
              구매요청일
            </div>

            {pagedOrders.flatMap((row) => {
              const approvedDate = row.approvedAt ?? row.requestDate;
              const detailHref = `/admin/purchase-history/${row.id}`;
              return [
                <Link
                  key={`${row.id}-1`}
                  href={detailHref}
                  className="flex h-20 items-center justify-center border-b border-line-gray text-base text-black-400 hover:bg-gray-50"
                >
                  {formatRequestDate(approvedDate)}
                </Link>,
                <Link
                  key={`${row.id}-2`}
                  href={detailHref}
                  className="flex h-20 items-center border-b border-line-gray pl-3 text-left text-base hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-black-400">
                      {row.productLabel
                        ? formatSummaryTitle(row.productLabel)
                        : "—"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      총 수량: {row.totalQuantity}개
                    </p>
                  </div>
                </Link>,
                <Link
                  key={`${row.id}-3`}
                  href={detailHref}
                  className="flex h-20 items-center justify-center border-b border-line-gray text-base text-black-400 hover:bg-gray-50"
                >
                  {formatAmount(row.orderAmount)}원
                </Link>,
                <Link
                  key={`${row.id}-4`}
                  href={detailHref}
                  className="flex h-20 flex-wrap items-center justify-center gap-2 border-b border-line-gray px-2 text-base text-black-400 hover:bg-gray-50"
                >
                  <span>김스낵</span>
                  {row.isInstantPurchase && (
                    <span
                      className="shrink-0 rounded-lg border px-2 py-0.5 text-center text-sm font-semibold"
                      style={{
                        color: "var(--Primary-orange-400, #F97B22)",
                        fontFamily: "Pretendard, sans-serif",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "22px",
                        borderColor: "var(--Primary-orange-200, #FDE1CD)",
                        background: "var(--Primary-orange-100, #FEF3EB)",
                      }}
                    >
                      즉시 구매
                    </span>
                  )}
                </Link>,
                <Link
                  key={`${row.id}-5`}
                  href={detailHref}
                  className="flex h-20 items-center justify-center border-b border-line-gray text-base text-black-400 hover:bg-gray-50"
                >
                  {row.approver ?? "김코드"}
                </Link>,
                <Link
                  key={`${row.id}-6`}
                  href={detailHref}
                  className="flex h-20 items-center justify-center border-b border-line-gray text-base text-black-400 hover:bg-gray-50"
                >
                  {formatRequestDate(approvedDate)}
                </Link>,
              ];
            })}
          </div>
        )}
      </div>

      {!loading && totalPages >= 1 && (
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex h-11 w-11 items-center justify-center rounded text-base font-normal text-black-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCurrentPage(n)}
              className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded px-2.5 text-base ${currentPage === n ? "font-bold text-black-400" : "font-normal text-black-400 hover:bg-gray-100"}`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-11 w-11 items-center justify-center rounded text-base font-normal text-black-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      )}
    </main>
  );
}
