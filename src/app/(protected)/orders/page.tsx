"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import {
  fetchOrders,
  fetchOrderDetail,
  cancelOrder,
  formatRequestDate,
  formatSummaryTitle,
  type Order,
} from "@/lib/api/orders";
import { toast } from "react-toastify";
import Image from "next/image";
import { getImageSrc } from "@/lib/utils/image";

type SortOption = "최신순" | "낮은 금액순" | "높은 금액순";

type CancelModalState = { orderId: string; productLabel: string | null } | null;

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
  const { refetchCart } = useCart();
  const [sortOption, setSortOption] = useState<SortOption>("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelModal, setCancelModal] = useState<CancelModalState>(null);
  const [cancelling, setCancelling] = useState(false);

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
      setCancelling(true);
      await cancelOrder(id);
      setCancelModal(null);
      toast.success(
        "요청이 취소되었습니다. 해당 상품이 장바구니에 다시 담겼습니다.",
      );
      await refetchCart();
      loadOrders();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "요청 취소에 실패했습니다.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = async (row: Order) => {
    setCancelModal({ orderId: row.id, productLabel: null });
    try {
      const detail = await fetchOrderDetail(row.id);
      const label = detail?.summaryTitle
        ? formatSummaryTitle(detail.summaryTitle)
        : detail?.items?.[0]?.name
          ? detail.items.length > 1
            ? `${detail.items[0].name} 외 ${detail.items.length - 1}건`
            : detail.items[0].name
          : row.productLabel
            ? formatSummaryTitle(row.productLabel)
            : "선택한 상품";
      setCancelModal((prev) =>
        prev?.orderId === row.id ? { ...prev, productLabel: label } : prev,
      );
    } catch {
      setCancelModal((prev) =>
        prev?.orderId === row.id
          ? {
              ...prev,
              productLabel: row.productLabel
                ? formatSummaryTitle(row.productLabel)
                : "선택한 상품",
            }
          : prev,
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 ml-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0">
        <h1 className="text-2xl font-bold text-black-400">구매 요청 내역</h1>
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
              gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
            }}
          >
            {/* 제목 행: pill 테두리, 높이 80px */}
            <div
              className="flex h-20 items-center justify-center rounded-l-[100px] border-b border-l border-t border-gray-200 bg-white pl-5 text-center text-base font-semibold text-black-400"
              style={{
                borderColor: "var(--color-gray-200, #E0E0E0)",
                background: "var(--color-gray-50, #FFF)",
              }}
            >
              구매요청일
            </div>
            <div
              className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
              style={{
                borderColor: "var(--color-gray-200, #E0E0E0)",
                background: "var(--color-gray-50, #FFF)",
              }}
            >
              상품정보
            </div>
            <div
              className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
              style={{
                borderColor: "var(--color-gray-200, #E0E0E0)",
                background: "var(--color-gray-50, #FFF)",
              }}
            >
              주문 금액
            </div>
            <div
              className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
              style={{
                borderColor: "var(--color-gray-200, #E0E0E0)",
                background: "var(--color-gray-50, #FFF)",
              }}
            >
              상태
            </div>
            <div
              className="flex h-20 items-center justify-center rounded-r-[100px] border-b border-r border-t border-gray-200 bg-white pr-5 text-center text-base font-semibold text-black-400"
              style={{
                borderColor: "var(--color-gray-200, #E0E0E0)",
                background: "var(--color-gray-50, #FFF)",
              }}
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
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={getImageSrc(row.image)}
                        alt={row.productLabel}
                        fill
                        className="object-contain"
                        sizes="56px"
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
                    {row.productLabel
                      ? `상품이름: ${formatSummaryTitle(row.productLabel)}`
                      : "—"}
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
                {formatAmount(row.orderAmount)}
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
                      openCancelModal(row);
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

      {cancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !cancelling && setCancelModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div
            className="inline-flex h-[560px] w-[704px] max-w-[95vw] flex-col items-center justify-center gap-12 rounded-[32px] bg-[#FBF8F4]"
            style={{
              padding: "40px 32px",
              boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/DOG!.png"
              alt=""
              width={260}
              height={200}
              className="h-auto w-full max-w-[260px] object-contain"
            />
            <h2
              id="cancel-modal-title"
              className="text-xl font-bold text-black-400"
            >
              구매 요청 취소
            </h2>
            <div className="flex flex-col items-center gap-1">
              <p className="text-center text-base text-black-400">
                {cancelModal.productLabel === null ? (
                  <span className="inline-block h-5 w-48 animate-pulse rounded bg-gray-200" />
                ) : (
                  `${cancelModal.productLabel} 구매 요청을 취소하시겠어요?`
                )}
              </p>
              <p className="text-center text-sm text-black-400">
                구매 요청 취소 후에는 복구할 수 없어요!
              </p>
            </div>
            <div className="flex flex-row flex-nowrap justify-center gap-4">
              <button
                type="button"
                onClick={() => !cancelling && setCancelModal(null)}
                disabled={cancelling}
                className="flex h-16 w-[310px] flex-shrink-0 items-center justify-center rounded-2xl bg-[#FDF0DF] p-4 font-medium text-primary-400 transition-colors hover:bg-[#FDF0DF]/90 disabled:opacity-50"
              >
                더 생각해볼게요
              </button>
              <button
                type="button"
                onClick={() => handleCancelRequest(cancelModal.orderId)}
                disabled={cancelling || cancelModal.productLabel === null}
                className="flex h-16 w-[310px] flex-shrink-0 items-center justify-center rounded-2xl bg-primary-400 p-4 font-medium text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              >
                취소할래요
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
