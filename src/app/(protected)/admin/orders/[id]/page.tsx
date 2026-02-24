"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import {
  fetchOrderDetailAdmin,
  updateAdminOrderStatus,
  formatRequestDate,
  formatSummaryTitle,
  type OrderDetail,
} from "@/lib/api/orders";
import { fetchBudgetCurrentAPI } from "@/lib/api/superAdmin";
import { toast } from "react-toastify";
import { getImageSrc } from "@/lib/utils/image";

type ResultModalType = "approve" | "reject" | null;

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { refetchCart } = useCart();

  const [data, setData] = useState<OrderDetail | null | undefined>(undefined);
  const [resultModal, setResultModal] = useState<ResultModalType>(null);
  const [processing, setProcessing] = useState(false);

  const [budgetInfo, setBudgetInfo] = useState<{
    spent: number;
    remaining: number;
  } | null>(null);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);

  const reloadData = useCallback(() => {
    if (!id) return;
    fetchOrderDetailAdmin(id).then((res) => setData(res ?? null));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    let cancelled = false;
    fetchOrderDetailAdmin(id).then((res) => {
      if (!cancelled) setData(res ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    fetchBudgetCurrentAPI()
      .then((res) => {
        if (cancelled) return;
        const b = res?.budget ?? {};
        const spent =
          typeof (b as any).spent_amount === "number"
            ? (b as any).spent_amount
            : typeof (b as any).budget_amount === "number" &&
                typeof (b as any).remaining === "number"
              ? Math.max(0, (b as any).budget_amount - (b as any).remaining)
              : 0;

        const remaining =
          typeof (b as any).remaining === "number"
            ? (b as any).remaining
            : typeof (b as any).budget_amount === "number" &&
                typeof (b as any).spent_amount === "number"
              ? Math.max(0, (b as any).budget_amount - (b as any).spent_amount)
              : 0;

        setBudgetInfo({ spent, remaining });
      })
      .catch(() => {
        if (!cancelled) setBudgetInfo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [budgetRefreshKey]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      await updateAdminOrderStatus(id, "approved");
      setResultModal("approve");
      reloadData();
      refetchCart();
      setBudgetRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "승인 처리에 실패했습니다.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      await updateAdminOrderStatus(id, "cancelled");
      setResultModal("reject");
      reloadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "반려 처리에 실패했습니다.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const isPending = data?.status === "승인 대기";

  if (data === undefined) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-[1920px] flex-col items-center justify-center bg-background-peach px-4 py-16">
        <p className="text-gray-500">불러오는 중...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-[1920px] flex-col items-center justify-center bg-background-peach px-4 py-16">
        <p className="mb-4 text-gray-500">요청 내역을 찾을 수 없습니다.</p>
        <Link
          href="/admin/orders"
          className="rounded-xl bg-[#FDF0DF] px-6 py-3 font-semibold text-primary-400 transition-colors hover:bg-primary-200/50"
        >
          목록 보기
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-0 w-full max-w-[1920px] overflow-x-auto bg-background-peach px-2 py-8 sm:px-4">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-start lg:gap-[24px]">
        <section className="min-w-0 flex-1 lg:w-[1041px] lg:flex-none">
          <h1 className="mb-2 text-2xl font-bold text-black-400">
            구매 요청 관리
          </h1>
          <h2 className="mb-2 text-lg font-semibold text-black-400">
            요청 품목
          </h2>

          {(data.summaryTitle || data.items.length > 0) && (
            <p className="mb-4 text-base text-gray-600">
              상품이름:{" "}
              {data.summaryTitle
                ? formatSummaryTitle(data.summaryTitle)
                : data.items[0]?.name
                  ? `${data.items[0].name} 및 ${data.totalCount}개`
                  : "—"}{" "}
              / 총 수량: {data.totalCount}개
            </p>
          )}

          <div
            className="mb-6 flex flex-col overflow-y-auto"
            style={{
              width: "1041px",
              height: "582px",
              padding: "40px",
              gap: "40px",
              alignSelf: "stretch",
              borderRadius: "16px",
              border: "1px solid var(--Black-Black-100, #6B6B6B)",
              background: "var(--gray-gray-50, #FFF)",
              boxShadow: "4px 4px 20px 0 rgba(250, 247, 243, 0.25)",
            }}
          >
            {data.items.map((item, idx) => (
              <div
                key={`${item.itemId ?? "item"}-${idx}`}
                className="flex items-center justify-between gap-4 border-b border-line-gray pb-4 last:border-b-0 last:pb-0"
                style={{ width: "961px", height: "80px", maxWidth: "100%" }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <Image
                        src={getImageSrc(item.image)}
                        alt={item.name}
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="font-medium text-black-400">{item.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      수량: {item.quantity}개
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-base text-black-400">
                    {Number(item.unitPrice).toLocaleString("ko-KR")}원
                  </p>
                  <p className="mt-1 font-medium text-black-400">
                    {formatPrice(Number(item.totalPrice))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full" style={{ width: "1041px", maxWidth: "100%" }}>
            <p className="mb-6 text-right">
              <span
                style={{
                  color: "var(--Black-Black-400, #1F1F1F)",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "32px",
                }}
              >
                총 {data.totalCount || data.items?.length || 0}개{" "}
              </span>
              <span
                style={{
                  color: "var(--Primary-orange-400, #F97B22)",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "32px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "42px",
                }}
              >
                {Number(data.totalAmount).toLocaleString("ko-KR")}원
              </span>
            </p>
          </div>

          <div
            className="flex flex-nowrap items-center gap-4"
            style={{ width: "1041px", maxWidth: "100%" }}
          >
            {isPending ? (
              <div className="flex w-full flex-1 gap-4">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex h-16 flex-1 items-center justify-center rounded-2xl bg-[#EFEFEF] p-4 text-base font-medium text-black-400 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  요청 반려
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex h-16 flex-1 items-center justify-center rounded-2xl bg-primary-400 p-4 text-base font-medium text-white transition-colors hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  요청 승인
                </button>
              </div>
            ) : (
              <Link
                href="/admin/orders"
                className="flex flex-1 items-center justify-center rounded-2xl bg-[#FDF0DF] py-4 text-base font-semibold text-primary-400 transition-colors hover:bg-primary-200/50"
                style={{ minHeight: 64 }}
              >
                목록 보기
              </Link>
            )}
          </div>
        </section>

        <aside className="w-full shrink-0 lg:w-[380px]">
          <div className="border-b border-line-gray bg-background-peach p-6">
            <h3 className="border-b border-line-gray pb-3 text-base font-semibold text-black-400">
              요청 정보
            </h3>
            <p className="mt-4 text-base text-black-400">
              {formatRequestDate(data.requestDate)}
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">
                요청인
              </label>
              <input
                type="text"
                readOnly
                value="김스낵"
                className="mt-1.5 w-full rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">
                요청 메시지
              </label>
              <textarea
                readOnly
                rows={4}
                value={(() => {
                  const productName =
                    data.items[0]?.name ??
                    (data.summaryTitle
                      ? data.summaryTitle.replace(/ 및 \d+개$/, "").trim()
                      : "") ??
                    "상품";
                  return `${productName} 인기가 많아요. 많이 주문하면 좋을 것 같아요!`;
                })()}
                className="mt-1.5 w-full resize-none rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
              />
            </div>
          </div>

          <div className="mt-6 border-b border-line-gray bg-background-peach p-6">
            <h3 className="border-b border-line-gray pb-3 text-base font-semibold text-black-400">
              예산 정보
            </h3>

            {budgetInfo ? (
              <>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600">
                    이번 달 지출액
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${budgetInfo.spent.toLocaleString("ko-KR")}원`}
                    className="mt-1.5 w-full rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600">
                    이번 달 남은 예산
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${budgetInfo.remaining.toLocaleString("ko-KR")}원`}
                    className="mt-1.5 w-full rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600">
                    구매 후 예산
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${Math.max(
                      0,
                      data.status === "승인 완료"
                        ? budgetInfo.remaining
                        : budgetInfo.remaining - Number(data.totalAmount),
                    ).toLocaleString("ko-KR")}원`}
                    className="mt-1.5 w-full rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
                  />
                </div>
              </>
            ) : (
              <p className="mt-4 text-base text-gray-500">
                예산 정보를 불러오는 중...
              </p>
            )}
          </div>
        </aside>
      </div>

      {resultModal === "approve" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-complete-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#FBF8F4] px-6 py-8 shadow-lg">
            <div className="flex flex-col items-center">
              <Image
                src="/happydog.png"
                alt=""
                width={200}
                height={120}
                className="object-contain"
              />
              <h2
                id="approval-complete-title"
                className="mt-4 text-xl font-bold text-black-400"
              >
                승인 완료
              </h2>
              <p className="mt-2 text-base text-gray-600">
                승인이 완료되었어요!
              </p>
              <p className="mt-1 text-sm text-gray-500">
                구매 내역을 통해 배송현황을 확인해보세요
              </p>
              <div className="mt-8 flex w-full gap-3">
                <Link
                  href="/"
                  className="flex-1 rounded-xl bg-[#FDF0DF] py-3.5 text-center font-medium text-primary-400 transition-colors hover:bg-primary-200/50"
                  onClick={() => setResultModal(null)}
                >
                  홈으로
                </Link>
                <Link
                  href="/admin/purchase-history"
                  className="flex-1 rounded-xl bg-primary-400 py-3.5 text-center font-medium text-white transition-colors hover:bg-primary-300"
                  onClick={() => setResultModal(null)}
                >
                  구매 내역 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultModal === "reject" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-complete-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#FBF8F4] px-6 py-8 shadow-lg">
            <div className="flex flex-col items-center">
              <Image
                src="/sorrydog.png"
                alt=""
                width={200}
                height={120}
                className="object-contain"
              />
              <h2
                id="reject-complete-title"
                className="mt-4 text-xl font-bold text-black-400"
              >
                요청 반려
              </h2>
              <p className="mt-2 text-base text-gray-600">
                요청이 반려되었어요
              </p>
              <p className="mt-1 text-sm text-gray-500">
                목록에서 다른 요청을 확인해보세요
              </p>
              <div className="mt-8 flex w-full gap-3">
                <Link
                  href="/"
                  className="flex-1 rounded-xl bg-[#FDF0DF] py-3.5 text-center font-medium text-primary-400 transition-colors hover:bg-primary-200/50"
                  onClick={() => setResultModal(null)}
                >
                  홈으로
                </Link>
                <Link
                  href="/admin/orders"
                  className="flex-1 rounded-xl bg-primary-400 py-3.5 text-center font-medium text-white transition-colors hover:bg-primary-300"
                  onClick={() => setResultModal(null)}
                >
                  구매 요청 목록
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
