"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchAdminOrders, updateAdminOrderStatus, formatRequestDate, formatSummaryTitle, type Order } from "@/lib/api/orders";
import { toast } from "react-toastify";
import { getImageSrc } from "@/lib/utils/image";

type ConfirmType = "approve" | "reject";

type SortOption = "최신순" | "낮은 금액순" | "높은 금액순";

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}


const SORT_MAP: Record<SortOption, string> = {
  최신순: "request_date:desc",
  "낮은 금액순": "order_amount:asc",
  "높은 금액순": "order_amount:desc",
};

export default function AdminOrdersPage() {
  const [sortOption, setSortOption] = useState<SortOption>("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ type: ConfirmType; orderId: string } | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({
        page: currentPage,
        limit: 10,
        sort: SORT_MAP[sortOption],
        status: "pending",
      });
      const apiOrders = res.data ?? [];
      setOrders(apiOrders);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (err) {
      setOrders([]);
      setTotalPages(1);
      toast.error(err instanceof Error ? err.message : "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortOption]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleReject = async (id: string) => {
    try {
      await updateAdminOrderStatus(id, "cancelled");
      setConfirmModal(null);
      toast.success("반려되었습니다. 해당 상품이 요청자 장바구니에 다시 담겼습니다.");
      loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "반려 처리에 실패했습니다.");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateAdminOrderStatus(id, "approved");
      setConfirmModal(null);
      toast.success("구매 요청을 승인했습니다.");
      loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "승인 처리에 실패했습니다.");
    }
  };

  const openConfirm = (type: ConfirmType, orderId: string) => setConfirmModal({ type, orderId });
  const closeConfirm = () => setConfirmModal(null);
  const onConfirmYes = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === "approve") await handleApprove(confirmModal.orderId);
    else await handleReject(confirmModal.orderId);
  };

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 ml-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0">
        <h1 className="text-2xl font-bold text-black-400">
          구매 요청 관리
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
        ) : orders.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center py-16">
            <Image
              src="/sadDog.png"
              alt=""
              width={388}
              height={304}
            />
          </div>
        ) : (
        <div
          className="min-w-[820px] overflow-x-auto"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
          }}
        >
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
            요청인
          </div>
          <div
            className="flex h-20 items-center justify-center rounded-r-[100px] border-b border-r border-t border-gray-200 bg-white pr-5 text-center text-base font-semibold text-black-400"
            style={{ borderColor: "var(--color-gray-200, #E0E0E0)", background: "var(--color-gray-50, #FFF)" }}
          >
            비고
          </div>

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
                {row.firstItemCategory ? (
                  <p className="text-sm text-gray-500">{row.firstItemCategory}</p>
                ) : null}
                <p className="font-medium text-black-400">
                  {row.productLabel ? `상품이름: ${formatSummaryTitle(row.productLabel)}` : "—"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  총 수량: {row.totalQuantity}개
                </p>
              </div>
            </Link>,
            <Link
              key={`${row.id}-3`}
              href={`/orders/${row.id}`}
              className="flex h-20 flex-col items-center justify-center gap-0.5 border-b border-line-gray text-center text-base text-black-400 hover:bg-gray-50"
            >
              <span className="text-sm text-gray-500">
                {row.totalQuantity > 0 ? formatAmount(Math.round(row.orderAmount / row.totalQuantity)) : 0}원 (1개당)
              </span>
              <span className="font-medium">{formatAmount(row.orderAmount)}원</span>
            </Link>,
            <Link
              key={`${row.id}-4`}
              href={`/orders/${row.id}`}
              className="flex h-20 items-center justify-center border-b border-line-gray text-center text-base text-black-400 hover:bg-gray-50"
            >
              김스낵
            </Link>,
            <div
              key={`${row.id}-5`}
              className="flex h-20 items-center justify-center gap-2 border-b border-line-gray pr-5 text-center text-base"
              style={{
                display: "flex",
                padding: "12px 80px",
                justifyContent: "space-between",
                alignItems: "center",
                alignSelf: "stretch",
                borderBottom: "1px solid var(--Line-Line-200, #E6E6E6)",
                background: "var(--Background-Background-400, #FBF8F4)",
              }}
              onClick={(e) => e.preventDefault()}
            >
              {row.status === "승인 대기" ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirm("reject", row.id);
                    }}
                    className="flex shrink-0 items-center justify-center rounded-lg font-medium text-black-400 transition-colors hover:opacity-90"
                    style={{
                      width: 94,
                      height: 44,
                      padding: "8px 16px",
                      gap: 10,
                      background: "var(--Background-Background-300, #EFEFEF)",
                    }}
                  >
                    반려
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirm("approve", row.id);
                    }}
                    className="flex shrink-0 items-center justify-center font-medium text-white transition-colors hover:opacity-90"
                    style={{
                      width: 94,
                      height: 44,
                      padding: "8px 16px",
                      gap: 10,
                      borderRadius: 8,
                      background: "var(--Primary-orange-400, #F97B22)",
                    }}
                  >
                    승인
                  </button>
                </>
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

      {confirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeConfirm}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p id="confirm-title" className="text-center text-lg font-semibold text-black-400">
              {confirmModal.type === "approve" ? "정말 승인하시겠습니까?" : "정말 반려하겠습니까?"}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-lg border border-line-gray bg-gray-100 px-6 py-2.5 font-medium text-black-400 hover:bg-gray-200"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirmYes}
                className="rounded-lg bg-primary-400 px-6 py-2.5 font-medium text-white hover:bg-primary-300"
              >
                {confirmModal.type === "approve" ? "승인" : "반려"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
