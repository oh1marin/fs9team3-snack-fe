"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  fetchAdminOrders,
  fetchOrderDetailAdmin,
  updateAdminOrderStatus,
  formatRequestDate,
  formatSummaryTitle,
  type Order,
  type OrderDetail,
} from "@/lib/api/orders";
import { toast } from "react-toastify";
import { getImageSrc } from "@/lib/utils/image";
import { useCart } from "@/contexts/CartContext";
import { fetchBudgetCurrentAPI } from "@/lib/api/superAdmin";

type ConfirmType = "approve" | "reject";

type SortOption = "최신순" | "낮은 금액순" | "높은 금액순";

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

const SORT_MAP: Record<SortOption, string> = {
  최신순: "request_date:desc",
  "낮은 금액순": "order_amount:asc",
  "높은 금액순": "order_amount:desc",
};

export default function AdminOrdersPage() {
  const { refetchCart } = useCart();
  const [sortOption, setSortOption] = useState<SortOption>("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    type: ConfirmType;
    orderId: string;
  } | null>(null);
  const [approvalDetail, setApprovalDetail] = useState<OrderDetail | null>(
    null,
  );
  const [approvalDetailLoading, setApprovalDetailLoading] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [approving, setApproving] = useState(false);
  const [budgetRemaining, setBudgetRemaining] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchAdminOrders({
        page: currentPage,
        limit: 10,
        sort: SORT_MAP[sortOption],
        status: "pending",
      });
      const apiOrders = res.data ?? [];
      setOrders(apiOrders);
      setTotalPages(Math.max(1, res.pagination?.totalPages ?? 1));
    } catch (err) {
      setOrders([]);
      setTotalPages(1);
      const msg =
        err instanceof Error ? err.message : "목록을 불러오지 못했습니다.";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortOption]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (confirmModal?.type === "approve" && confirmModal?.orderId) {
      setApprovalDetail(null);
      setApprovalMessage("");
      setBudgetRemaining(null);
      setApprovalDetailLoading(true);
      Promise.all([
        fetchOrderDetailAdmin(confirmModal.orderId),
        fetchBudgetCurrentAPI(),
      ])
        .then(([detail, budgetRes]) => {
          setApprovalDetail(detail ?? null);
          const b = budgetRes?.budget ?? {};
          const remaining =
            typeof b.remaining === "number"
              ? b.remaining
              : typeof b.budget_amount === "number" &&
                  typeof b.spent_amount === "number"
                ? Math.max(0, b.budget_amount - b.spent_amount)
                : null;
          setBudgetRemaining(remaining);
        })
        .catch(() => {
          setApprovalDetail(null);
          setBudgetRemaining(null);
        })
        .finally(() => setApprovalDetailLoading(false));
    }
  }, [confirmModal?.type, confirmModal?.orderId]);

  const handleReject = async (id: string) => {
    try {
      await updateAdminOrderStatus(id, "cancelled");
      setConfirmModal(null);
      toast.success(
        "반려되었습니다. 해당 상품이 요청자 장바구니에 다시 담겼습니다.",
      );
      loadOrders();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "반려 처리에 실패했습니다.",
      );
    }
  };

  const handleApprove = async (id: string, message?: string) => {
    try {
      setApproving(true);
      await updateAdminOrderStatus(
        id,
        "approved",
        message ? { resultMessage: message } : undefined,
      );
      setConfirmModal(null);
      setApprovalDetail(null);
      setApprovalMessage("");
      setBudgetRemaining(null);
      toast.success("구매 요청을 승인했습니다.");
      loadOrders();
      refetchCart();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "승인 처리에 실패했습니다.",
      );
    } finally {
      setApproving(false);
    }
  };

  const openConfirm = (type: ConfirmType, orderId: string) =>
    setConfirmModal({ type, orderId });
  const closeConfirm = () => {
    setConfirmModal(null);
    setApprovalDetail(null);
    setApprovalMessage("");
    setBudgetRemaining(null);
  };
  const onConfirmYes = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === "approve")
      await handleApprove(confirmModal.orderId, approvalMessage);
    else await handleReject(confirmModal.orderId);
  };

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 ml-[clamp(2rem,8.33vw,10rem)] max-[1100px]:ml-0">
        <h1 className="text-2xl font-bold text-black-400">구매 요청 관리</h1>
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
        ) : orders.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 py-16">
            <Image src="/sadDog.png" alt="결과 없음" width={388} height={304} />
            <p className="text-center text-gray-500">
              {loadError ? loadError : "승인 대기 중인 구매 요청이 없습니다."}
            </p>
            {loadError && (
              <button
                type="button"
                onClick={() => loadOrders()}
                className="rounded-lg bg-primary-400 px-6 py-2.5 font-medium text-white hover:bg-primary-300"
              >
                다시 시도
              </button>
            )}
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
              요청인
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

            {orders.flatMap((row) => [
              <Link
                key={`${row.id}-1`}
                href={`/admin/orders/${row.id}`}
                className="flex h-20 items-center border-b border-line-gray pl-5 text-center text-base text-black-400 hover:bg-gray-50"
              >
                {formatRequestDate(row.requestDate)}
              </Link>,
              <Link
                key={`${row.id}-2`}
                href={`/admin/orders/${row.id}`}
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
                  {row.firstItemCategory ? (
                    <p className="text-sm text-gray-500">
                      {row.firstItemCategory}
                    </p>
                  ) : null}
                  <p className="font-medium text-black-400">
                    {row.productLabel
                      ? `상품이름: ${formatSummaryTitle(row.productLabel)}`
                      : "—"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    총 수량: {row.totalQuantity}개
                  </p>
                </div>
              </Link>,
              <Link
                key={`${row.id}-3`}
                href={`/admin/orders/${row.id}`}
                className="flex h-20 flex-col items-center justify-center gap-0.5 border-b border-line-gray text-center text-base text-black-400 hover:bg-gray-50"
              >
                <span className="text-sm text-gray-500">
                  {row.totalQuantity > 0
                    ? formatAmount(
                        Math.round(row.orderAmount / row.totalQuantity),
                      )
                    : 0}
                  원 (1개당)
                </span>
                <span className="font-medium">
                  {formatAmount(row.orderAmount)}원
                </span>
              </Link>,
              <Link
                key={`${row.id}-4`}
                href={`/admin/orders/${row.id}`}
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

      {confirmModal && confirmModal.type === "reject" && (
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
            <p
              id="confirm-title"
              className="text-center text-lg font-semibold text-black-400"
            >
              정말 반려하겠습니까?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-2xl bg-[#FDF0DF] px-6 py-2.5 font-medium text-primary-400 transition-colors hover:bg-[#FDF0DF]/90"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirmYes}
                className="rounded-lg bg-primary-400 px-6 py-2.5 font-medium text-white hover:bg-primary-300"
              >
                반려
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal && confirmModal.type === "approve" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeConfirm}
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-modal-title"
        >
          <div
            className="inline-flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-[#FBF8F4]"
            style={{
              padding: "32px 24px 40px 24px",
              justifyContent: "flex-start",
              alignItems: "stretch",
              gap: "32px",
              boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full pb-4"
              style={{
                borderBottom: "1px solid var(--Primary-orange-300, #FCC49C)",
              }}
            >
              <h2
                id="approval-modal-title"
                className="text-left text-xl font-bold text-black-400"
              >
                구매 요청 승인
              </h2>
            </div>

            <div
              className="flex min-h-0 w-full flex-1 flex-col self-stretch overflow-hidden"
              style={{ marginTop: -10 }}
            >
              {approvalDetailLoading ? (
                <div className="min-h-[160px] animate-pulse rounded-xl bg-gray-200/50 py-6" />
              ) : approvalDetail ? (
                <>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-600">
                      요청인
                    </label>
                    <div
                      className="rounded-xl bg-[#FBF8F4] px-4 py-3 text-base font-semibold text-black-400"
                      style={{
                        border: "1px solid var(--Primary-orange-300, #FCC49C)",
                      }}
                    >
                      김스낵
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="mb-1.5 block text-sm font-medium text-gray-600">
                      요청 품목
                    </label>
                    <div
                      className="flex max-h-[200px] flex-col overflow-y-auto rounded-xl bg-[#FBF8F4] p-4"
                      style={{
                        border: "1px solid var(--Primary-orange-300, #FCC49C)",
                      }}
                    >
                      {approvalDetail.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 py-3 ${idx < approvalDetail.items.length - 1 ? "border-b border-line-gray" : ""}`}
                        >
                          <div className="flex shrink-0 flex-col items-center gap-1">
                            <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                              {item.image ? (
                                <Image
                                  src={getImageSrc(item.image)}
                                  alt={item.name}
                                  fill
                                  className="object-contain"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                  이미지 없음
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              수량: {item.quantity}개
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-500">
                              {item.category || "—"}
                            </p>
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-black-400">
                                {item.name}
                              </p>
                              <span className="shrink-0 text-sm text-black-400">
                                {formatPrice(item.unitPrice)}
                              </span>
                            </div>
                            <div className="mt-1 flex justify-end text-sm">
                              <span className="font-semibold text-black-400">
                                {formatPrice(item.totalPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mb-3 flex flex-col gap-4 py-4"
                    style={{
                      borderBottom:
                        "1px solid var(--Primary-orange-300, #FCC49C)",
                    }}
                  >
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-medium text-black-400">
                        총{" "}
                        {approvalDetail.totalCount ||
                          approvalDetail.items.length}
                        건
                      </span>
                      <span className="text-xl font-bold text-primary-400">
                        {formatPrice(approvalDetail.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-medium text-gray-600">
                        남은 예산 금액
                      </span>
                      <span className="text-xl font-semibold text-black-400">
                        {budgetRemaining != null
                          ? formatPrice(budgetRemaining)
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-medium text-gray-600">
                        구매 후 예산
                      </span>
                      <span className="text-xl font-semibold text-black-400">
                        {budgetRemaining != null && approvalDetail
                          ? formatPrice(
                              Math.max(
                                0,
                                budgetRemaining - approvalDetail.totalAmount,
                              ),
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-600">
                      승인 메시지
                    </label>
                    <textarea
                      value={approvalMessage}
                      onChange={(e) => setApprovalMessage(e.target.value)}
                      placeholder="승인 메시지를 입력해주세요."
                      rows={3}
                      className="w-full resize-none rounded-xl bg-white px-4 py-3 text-base text-black-400 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      style={{
                        border: "1px solid var(--Primary-orange-300, #FCC49C)",
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex min-h-[120px] items-center justify-center py-8">
                  <p className="text-gray-500">
                    요청 내역을 불러올 수 없습니다.
                  </p>
                </div>
              )}
            </div>

            <div
              className="flex w-full gap-3 self-stretch"
              style={{ marginTop: 20 }}
            >
              <button
                type="button"
                onClick={closeConfirm}
                className="flex-1 rounded-2xl bg-[#FDF0DF] py-3.5 font-medium text-primary-400 transition-colors hover:bg-[#FDF0DF]/90"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirmYes}
                disabled={!approvalDetail || approving}
                className="flex-1 rounded-xl bg-primary-400 py-3.5 font-medium text-white transition-colors hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                승인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
