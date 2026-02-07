"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/contexts/CartContext";
import OrderSummary from "@/components/OrderSummary";
import { toast } from "react-toastify";

const DELIVERY_FEE = 3000;

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, removeAll, removeSelected } =
    useCart();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedItems = items.filter((it) => selectedIds.has(it.id));
  const productAmount = selectedItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const deliveryFee = selectedItems.length > 0 ? DELIVERY_FEE : 0;
  const totalAmount = productAmount + deliveryFee;
  const totalQuantity = selectedItems.reduce((sum, it) => sum + it.quantity, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((it) => it.id)));
    }
  };

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) return;
    updateQuantity(item.id, next);
  };

  const handleDeleteAll = () => {
    removeAll();
    setSelectedIds(new Set());
    toast.success("전체 상품이 삭제되었습니다.");
  };

  const handleDeleteSelected = () => {
    removeSelected([...selectedIds]);
    setSelectedIds(new Set());
    toast.success("선택 상품이 삭제되었습니다.");
  };

  const handleInstantRequest = (item: CartItem) => {
    toast.info("즉시 요청 기능은 준비 중입니다.");
  };

  const handlePurchaseRequest = () => {
    if (selectedItems.length === 0) {
      toast.warn("상품을 선택해 주세요.");
      return;
    }
    toast.info("구매 요청 기능은 준비 중입니다.");
  };

  return (
    <main className="mx-auto flex min-h-[1800px] w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-black-400" style={{ marginLeft: "clamp(2rem, 8.33vw, 10rem)" }}>장바구니</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-background-peach py-16 text-center">
          <p className="mb-4 text-lg text-black-200">
            장바구니에 담긴 상품이 없습니다.
          </p>
          <Link
            href="/items"
            className="rounded-xl bg-primary-400 px-6 py-3 text-md-sb text-white transition-colors hover:bg-primary-300"
          >
            상품 리스트로 가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-row items-start gap-6">
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl p-2 sm:p-4">
            <div className="overflow-x-hidden overflow-y-auto" style={{ maxHeight: "clamp(560px, 39.8vw, 760px)" }}>
              <table className="cart-table w-full" style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed", minWidth: 0 }}>
                <thead className="sticky top-0 z-10 bg-background-peach">
                  <tr className="bg-background-peach">
                    <th className="py-6 pl-4 pr-2 sm:py-11 sm:pl-10 sm:pr-6" style={{ width: "47.4%" }}>
                      <div className="flex items-center" style={{ marginLeft: "clamp(2rem, 8.33vw, 10rem)", gap: "clamp(8px, 1.67vw, 32px)" }}>
                        <label className="cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={
                              items.length > 0 &&
                              selectedIds.size === items.length
                            }
                            onChange={toggleSelectAll}
                            className="cart-checkbox h-5 w-5 focus:outline-none focus:ring-2 focus:ring-[#F97B22] focus:ring-offset-2"
                          />
                        </label>
                        <span
                          className="flex-1 text-left"
                          style={{
                            color: "var(--color-black-100, #6B6B6B)",
                            fontFamily: "Pretendard, sans-serif",
                            fontSize: "clamp(14px, 1.04vw, 20px)",
                            fontStyle: "normal",
                            fontWeight: 400,
                            lineHeight: "32px",
                          }}
                        >
                          상품정보
                        </span>
                      </div>
                    </th>
                    <th className="cart-col-divider py-6 px-2 text-center text-xs font-semibold text-black-400 sm:py-11 sm:px-6 sm:text-sm" style={{ borderLeft: "1px solid #E6E6E6", width: "17.55%" }}>
                      수량
                    </th>
                    <th className="cart-col-divider py-6 px-2 text-center text-xs font-semibold text-black-400 sm:py-11 sm:px-6 sm:text-sm" style={{ borderLeft: "1px solid #E6E6E6", width: "17.55%" }}>
                      주문 금액
                    </th>
                    <th className="cart-col-divider py-6 pl-2 pr-4 text-center text-xs font-semibold text-black-400 sm:pl-6 sm:pr-10 sm:text-sm" style={{ borderLeft: "1px solid #E6E6E6", width: "17.66%" }}>
                      배송 정보
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className="bg-background-peach"
                      style={{ height: "clamp(128px, 8.75vw, 168px)" }}
                    >
                      <td className="relative py-4 pl-4 pr-2 align-top sm:py-5 sm:pl-10 sm:pr-6" style={{ width: "47.4%", height: "clamp(128px, 8.75vw, 168px)", overflow: "hidden" }}>
                        <div className="flex items-start gap-2 pr-4 sm:gap-4 sm:pr-10" style={{ gap: "clamp(8px, 0.83vw, 16px)" }}>
                          <div className="flex min-w-0 flex-1 items-start" style={{ marginLeft: "clamp(2rem, 8.33vw, 10rem)", gap: "clamp(8px, 0.83vw, 16px)" }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleSelect(item.id)}
                              className="cart-checkbox h-4 w-4 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#F97B22] focus:ring-offset-2 sm:h-5 sm:w-5"
                            />
                            <div
                              className="relative shrink-0 overflow-hidden rounded-lg bg-gray-100"
                              style={{ width: "clamp(70px, 6.25vw, 120px)", height: "clamp(70px, 6.25vw, 120px)", minWidth: "clamp(70px, 6.25vw, 120px)", minHeight: "clamp(70px, 6.25vw, 120px)" }}
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="120px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-center pl-2 text-left sm:pl-4">
                              <p
                                className="mt-1 first:mt-0 line-clamp-2 text-left sm:mt-1.5"
                                style={{
                                  color: "var(--color-black-400, #1F1F1F)",
                                  fontFamily: "Pretendard, sans-serif",
                                  fontSize: "clamp(14px, 1.04vw, 20px)",
                                  fontStyle: "normal",
                                  fontWeight: 400,
                                  lineHeight: "32px",
                                }}
                              >
                                {item.title || "상품"}
                              </p>
                              <p
                                className="mt-1 text-left sm:mt-1.5"
                                style={{
                                  color: "var(--color-black-400, #1F1F1F)",
                                  fontFamily: "Pretendard, sans-serif",
                                  fontSize: "clamp(16px, 1.25vw, 24px)",
                                  fontStyle: "normal",
                                  fontWeight: 700,
                                  lineHeight: "32px",
                                }}
                              >
                                {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.id);
                            toast.success("상품이 삭제되었습니다.");
                          }}
                          className="absolute right-2 p-1.5 text-gray-400 transition-colors hover:text-black-400 sm:right-6 sm:p-2"
                          style={{ top: "clamp(0.25rem, 1vw, 1rem)" }}
                          aria-label="삭제"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M15 5L5 15M5 5l10 10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="cart-col-divider w-[17.55%] py-4 px-2 align-middle sm:py-5 sm:px-6" style={{ borderLeft: "1px solid #E6E6E6" }}>
                        <div className="flex items-center justify-center">
                          <div
                            className="flex shrink-0 items-center gap-1.5 sm:gap-3"
                            style={{
                              width: "clamp(120px, 8.33vw, 160px)",
                              minWidth: "120px",
                              height: "54px",
                              padding: "0 0.75rem",
                              justifyContent: "flex-end",
                              borderRadius: "16px",
                              border: "1px solid var(--color-primary-300, #FCC49C)",
                              background: "var(--color-gray-50, #FFF)",
                            }}
                          >
                            <span className="min-w-[3.25rem] text-right text-lg-m text-primary-400">
                              {item.quantity} 개
                            </span>
                            <div className="flex flex-col items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, 1)}
                                className="flex items-center justify-center text-primary-400 transition-colors hover:opacity-80"
                                style={{ minWidth: "2rem", minHeight: "2rem", width: "2rem", height: "2rem" }}
                                aria-label="수량 증가"
                              >
                                <Image src="/upsemo.png" alt="수량 증가" width={13} height={13} className="object-contain" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, -1)}
                                className="flex items-center justify-center text-primary-400 transition-colors hover:opacity-80"
                                style={{ minWidth: "2rem", minHeight: "2rem", width: "2rem", height: "2rem", marginTop: "-14px" }}
                                aria-label="수량 감소"
                              >
                                <Image src="/downsemo.png" alt="수량 감소" width={13} height={13} className="object-contain" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="cart-col-divider w-[17.55%] py-4 px-2 align-middle text-center sm:py-5 sm:px-6" style={{ borderLeft: "1px solid #E6E6E6" }}>
                        <p
                          className="text-center"
                          style={{
                            color: "var(--color-black-400, #1F1F1F)",
                            fontFamily: "Pretendard, sans-serif",
                            fontSize: "24px",
                            fontStyle: "normal",
                            fontWeight: 700,
                            lineHeight: "32px",
                          }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleInstantRequest(item)}
                          className="text-xl-sb text-white transition-colors hover:bg-primary-300"
                          style={{
                            width: "131px",
                            height: "50px",
                            marginTop: "20px",
                            borderRadius: "100px",
                            background: "var(--color-primary-400, #F97B22)",
                          }}
                        >
                          즉시 요청
                        </button>
                      </td>
                      <td className="cart-col-divider w-[17.66%] py-4 pl-2 pr-4 align-middle text-center sm:py-5 sm:pl-6 sm:pr-10" style={{ borderLeft: "1px solid #E6E6E6" }}>
                        <p
                          className="text-center"
                          style={{
                            color: "var(--color-black-400, #1F1F1F)",
                            fontFamily: "Pretendard, sans-serif",
                            fontSize: "20px",
                            fontStyle: "normal",
                            fontWeight: 700,
                            lineHeight: "32px",
                          }}
                        >
                          {formatPrice(DELIVERY_FEE)}
                        </p>
                        <p
                          className="mt-1 text-center"
                          style={{
                            color: "var(--color-black-100, #6B6B6B)",
                            fontFamily: "Pretendard, sans-serif",
                            fontSize: "20px",
                            fontStyle: "normal",
                            fontWeight: 400,
                            lineHeight: "32px",
                          }}
                        >
                          택배 배송
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <OrderSummary
            totalQuantity={totalQuantity}
            productAmount={productAmount}
            deliveryFee={deliveryFee}
            totalAmount={totalAmount}
            onPurchaseRequest={handlePurchaseRequest}
            continueShoppingHref="/items"
          />
        </div>
      )}

      <div className="mt-auto flex gap-3 px-0 py-2 sm:py-3 bg-[#FBF8F4]">
        <button
          type="button"
          onClick={handleDeleteAll}
          className="flex items-center justify-center rounded-full border border-gray-200 bg-background-peach text-md-sb text-black-300 transition-colors hover:bg-gray-100"
          style={{ borderColor: "var(--color-gray-200, #E0E0E0)", width: 139, height: 50 }}
        >
          전체 상품 삭제
        </button>
        <button
          type="button"
          onClick={handleDeleteSelected}
          className="flex items-center justify-center rounded-full border border-gray-200 bg-background-peach text-md-sb text-black-300 transition-colors hover:bg-gray-100"
          style={{ borderColor: "var(--color-gray-200, #E0E0E0)", width: 139, height: 50 }}
        >
          선택 상품 삭제
        </button>
      </div>
    </main>
  );
}