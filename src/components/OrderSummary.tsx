"use client";

import Link from "next/link";

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export interface OrderSummaryProps {
  /** 선택된 상품 총 수량 */
  totalQuantity: number;
  /** 상품 금액 합계 */
  productAmount: number;
  /** 배송비 */
  deliveryFee: number;
  /** 총 주문 금액 */
  totalAmount: number;
  /** 구매 요청 버튼 클릭 */
  onPurchaseRequest: () => void;
  /** 계속 쇼핑하기 링크 (기본: /items) */
  continueShoppingHref?: string;
}

export default function OrderSummary({
  totalQuantity,
  productAmount,
  deliveryFee,
  totalAmount,
  onPurchaseRequest,
  continueShoppingHref = "/items",
}: OrderSummaryProps) {
  return (
    <aside
      className="flex shrink-0 flex-col overflow-visible"
      style={{
        width: "min(386px, max(280px, 20.1vw))",
        height: "min(466px, max(386px, 24.27vw))",
      }}
    >
      <div
        className="flex w-full flex-col justify-center shrink-0 rounded-2xl p-4 text-black-400 sm:p-6"
        style={{
          width: "100%",
          height: "clamp(230px, 15.1vw, 290px)",
          fontSize: "clamp(13px, 0.83vw, 14px)",
          borderRadius: "16px",
          border: "1px solid var(--Line-Line-100, #F2F2F2)",
          background: "var(--gray-gray-50, #FFF)",
          boxShadow: "4px 4px 20px 0 rgba(250, 247, 243, 0.25)",
          marginBottom: "32px",
        }}
      >
        <div className="space-y-3 sm:space-y-4">
          <div
            className="flex items-center justify-between"
            style={{
              color: "var(--Black-Black-100, #6B6B6B)",
              fontFamily: "Pretendard, sans-serif",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "26px",
              textAlign: "center",
            }}
          >
            <span>총 주문 상품</span>
            <span
              className="font-bold"
              style={{
                fontFamily: "Pretendard, sans-serif",
                fontSize: "24px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "32px",
                textAlign: "center",
              }}
            >
              <span className="text-primary-400">{totalQuantity}</span>
              <span className="text-black-500"> 개</span>
            </span>
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              color: "var(--Black-Black-100, #6B6B6B)",
              fontFamily: "Pretendard, sans-serif",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "26px",
              textAlign: "center",
            }}
          >
            <span>상품금액</span>
            <span
              className="font-bold text-black-500"
              style={{
                fontFamily: "Pretendard, sans-serif",
                fontSize: "24px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "32px",
                textAlign: "center",
              }}
            >
              {formatPrice(productAmount)}
            </span>
          </div>
          <div
            className="flex items-center justify-between"
            style={{
              color: "var(--Black-Black-100, #6B6B6B)",
              fontFamily: "Pretendard, sans-serif",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "26px",
              textAlign: "center",
            }}
          >
            <span>배송비</span>
            <span
              className="font-bold text-black-500"
              style={{
                fontFamily: "Pretendard, sans-serif",
                fontSize: "24px",
                fontStyle: "normal",
                fontWeight: 700,
                lineHeight: "32px",
                textAlign: "center",
              }}
            >
              {formatPrice(deliveryFee)}
            </span>
          </div>
          <div className="border-t border-line-gray pt-4">
            <div className="flex items-center justify-between">
              <span
                style={{
                  color: "var(--Black-Black-500, #040404)",
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "26px",
                  textAlign: "center",
                }}
              >
                총 주문금액
              </span>
              <span
                className="font-bold text-primary-400"
                style={{
                  fontFamily: "Pretendard, sans-serif",
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "32px",
                  textAlign: "center",
                }}
              >
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4 bg-background-peach">
        <div
          className="flex w-full items-center justify-center"
          style={{ width: "100%", height: "64px" }}
        >
          <button
            type="button"
            onClick={onPurchaseRequest}
            className="h-[64px] w-full rounded-xl bg-primary-400 text-white"
            style={{ fontSize: "clamp(14px, 0.94vw, 18px)", fontWeight: 600 }}
          >
            구매 요청
          </button>
        </div>
        <div
          className="flex w-full items-center justify-center rounded-b-2xl"
          style={{ width: "100%", height: "64px" }}
        >
          <Link
            href={continueShoppingHref}
            className="flex h-[64px] w-full items-center justify-center text-primary-400"
            style={{
              fontSize: "clamp(13px, 0.73vw, 14px)",
              fontWeight: 600,
              borderRadius: "16px",
              background: "var(--Background-Background-500, #FDF0DF)",
            }}
          >
            계속 쇼핑하기
          </Link>
        </div>
      </div>
    </aside>
  );
}
