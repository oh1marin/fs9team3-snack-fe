"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

const PURCHASE_COMPLETE_KEY = "snack_purchase_complete";

export interface PurchaseCompleteData {
  firstProductTitle: string;
  firstProductImage: string;
  totalQuantity: number;
  totalAmount: number;
  message: string;
}

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

/** 기본 요청 메시지 생성 */
function getDefaultMessage(productName: string): string {
  if (!productName?.trim()) return "많이 주문하면 좋을 것 같아요!";
  const name = productName.trim();
  const lastChar = name[name.length - 1];
  const code = lastChar.charCodeAt(0);
  const hasJongseong = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  const josa = hasJongseong ? "이" : "가";
  return `${name}${josa} 인기가 많아요.\n많이 주문하면 좋을 것 같아요!`;
}

export default function CartCompletePage() {
  const [data, setData] = useState<PurchaseCompleteData | null>(null);
  const { items: cartItems, refetchCart } = useCart();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(PURCHASE_COMPLETE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PurchaseCompleteData;
        setData(parsed);
        sessionStorage.removeItem(PURCHASE_COMPLETE_KEY);
      }
    } catch {
      setData(null);
    }
  }, []);

  // 구매요청 완료 페이지에서 장바구니 남은 개수 확인 → "장바구니로 돌아가기" 노출 여부
  useEffect(() => {
    refetchCart();
  }, [refetchCart]);

  if (data === null) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-[1920px] flex-col items-center justify-center bg-background-peach px-4 py-16">
        <p className="mb-4 text-gray-500">요청 정보를 찾을 수 없습니다.</p>
        <Link
          href="/cart"
          className="rounded-xl bg-primary-400 px-6 py-3 font-semibold text-white hover:bg-primary-300"
        >
          장바구니로 돌아가기
        </Link>
      </main>
    );
  }

  const productLabel =
    data.totalQuantity > 1
      ? `${data.firstProductTitle} 외 ${data.totalQuantity - 1}개`
      : data.firstProductTitle;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col items-center overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <div
        className="flex w-full flex-col items-center text-center"
        style={{
          width: "100%",
          maxWidth: "min(680px, max(280px, 42vw))",
        }}
      >
        <h1
          className="mb-3 w-full font-bold text-black-400"
          style={{ fontSize: "clamp(1.5rem, 0.8vw + 1.2rem, 2rem)" }}
        >
          구매 요청 완료
        </h1>
        <p
          className="mb-10 w-full text-gray-500"
          style={{ fontSize: "clamp(1rem, 0.4vw + 0.9rem, 1.125rem)" }}
        >
          관리자에게 성공적으로 구매 요청이 완료되었습니다.
        </p>

        <section className="mb-8 w-full text-left">
          <h2
            className="border-b border-line-gray pb-4 font-semibold text-black-400"
            style={{ fontSize: "clamp(1.125rem, 0.4vw + 1rem, 1.375rem)" }}
          >
            상품 정보
          </h2>
          <div className="flex items-center justify-between pt-5">
            <div className="flex min-w-0 flex-1 items-center gap-5">
              <div
                className="relative shrink-0 overflow-hidden rounded-lg bg-gray-100"
                style={{
                  width: "clamp(72px, 4vw + 40px, 96px)",
                  height: "clamp(72px, 4vw + 40px, 96px)",
                }}
              >
                {data.firstProductImage ? (
                  <Image
                    src={data.firstProductImage}
                    alt={data.firstProductTitle}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="font-medium text-black-400"
                  style={{ fontSize: "clamp(1rem, 0.4vw + 0.9rem, 1.125rem)" }}
                >
                  {productLabel}
                </p>
                <p
                  className="mt-1 text-gray-500"
                  style={{ fontSize: "clamp(0.875rem, 0.25vw + 0.8rem, 1rem)" }}
                >
                  청량 · 탄산음료
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end text-right">
              <span
                className="font-medium text-black-400"
                style={{ fontSize: "clamp(0.875rem, 0.25vw + 0.8rem, 1rem)" }}
              >
                총 {data.totalQuantity}개
              </span>
              <span
                className="mt-1.5 font-bold text-primary-400"
                style={{ fontSize: "clamp(1.125rem, 0.5vw + 1rem, 1.375rem)" }}
              >
                {formatPrice(data.totalAmount)}
              </span>
            </div>
          </div>
        </section>

        <section className="mb-10 w-full text-left">
          <h2
            className="mb-4 font-semibold text-black-400"
            style={{ fontSize: "clamp(1.125rem, 0.4vw + 1rem, 1.375rem)" }}
          >
            요청 메시지
          </h2>
          <div
            className="min-h-[120px] rounded-2xl border border-line-gray bg-background-peach p-5"
            style={{ minHeight: "clamp(120px, 6vw + 60px, 160px)" }}
          >
            <p
              className="whitespace-pre-wrap text-black-400"
              style={{ fontSize: "clamp(1rem, 0.4vw + 0.9rem, 1.125rem)" }}
            >
              {data.message || getDefaultMessage(data.firstProductTitle)}
            </p>
          </div>
        </section>

        <div className="flex flex-nowrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/cart"
            className="flex shrink-0 items-center justify-center text-lg font-semibold text-primary-400 transition-colors hover:opacity-90"
            style={{
              width: 310,
              height: 64,
              borderRadius: 16,
              background: "var(--Background-Background-500, #FDF0DF)",
            }}
          >
            장바구니로 돌아가기
          </Link>
          <Link
            href="/orders"
            className="flex h-16 w-[310px] shrink-0 items-center justify-center rounded-xl bg-primary-400 text-lg font-semibold text-white transition-colors hover:bg-primary-300"
          >
            요청 내역 확인하기
          </Link>
        </div>
      </div>
    </main>
  );
}
