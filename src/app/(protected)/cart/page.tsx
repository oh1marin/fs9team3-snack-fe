"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/contexts/CartContext";
import OrderSummary from "@/components/OrderSummary";
import { toast } from "react-toastify";
import { createOrder } from "@/lib/api/orders";

const PURCHASE_COMPLETE_KEY = "snack_purchase_complete";

const DELIVERY_FEE = 3000;

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function CartPage() {
  const router = useRouter();
  const { items, cartLoaded, updateQuantity, removeItem, removeAll, removeSelected } =
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

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) return;
    try {
      await updateQuantity(item.id, next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "수량 변경에 실패했습니다.");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await removeAll();
      setSelectedIds(new Set());
      toast.success("전체 상품이 삭제되었습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "장바구니 비우기에 실패했습니다.");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await removeSelected([...selectedIds]);
      setSelectedIds(new Set());
      toast.success("선택 상품이 삭제되었습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "선택 삭제에 실패했습니다.");
    }
  };

  const handleInstantRequest = async (item: CartItem) => {
    const totalQuantity = item.quantity;
    const productAmount = item.price * item.quantity;
    const totalAmount = productAmount + DELIVERY_FEE;
    const payload = {
      firstProductTitle: item.title || "상품",
      firstProductImage: item.image || "",
      totalQuantity,
      totalAmount,
      message: "",
    };
    try {
      await createOrder({
        items: [{
          id: item.id,
          title: item.title || "상품",
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        }],
        totalQuantity,
        totalAmount,
      });
      sessionStorage.setItem(PURCHASE_COMPLETE_KEY, JSON.stringify(payload));
      try {
        await removeItem(item.id);
      } catch {
        // 주문은 완료됐으므로 진행
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      router.push("/cart/complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "구매 요청에 실패했습니다.");
    }
  };

  const handlePurchaseRequest = async () => {
    if (selectedItems.length === 0) {
      toast.warn("상품을 선택해 주세요.");
      return;
    }
    const first = selectedItems[0];
    const payload = {
      firstProductTitle: first?.title || "상품",
      firstProductImage: first?.image || "",
      totalQuantity,
      totalAmount,
      message: "",
    };
    try {
      await createOrder({
        items: selectedItems.map((it) => ({
          id: it.id,
          title: it.title || "상품",
          quantity: it.quantity,
          price: it.price,
          image: it.image,
        })),
        totalQuantity,
        totalAmount,
      });
      sessionStorage.setItem(PURCHASE_COMPLETE_KEY, JSON.stringify(payload));
      try {
        await removeSelected([...selectedIds]);
      } catch {
        // 주문은 완료됐으므로 진행
      }
      setSelectedIds(new Set());
      router.push("/cart/complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "구매 요청에 실패했습니다.");
    }
  };

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-left text-2xl font-bold text-black-400 max-[1100px]:ml-0 min-[1101px]:ml-[calc(clamp(2rem,8.33vw,10rem)-80px)]">장바구니</h1>

      {!cartLoaded ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-gray-500">불러오는 중...</p>
        </div>
      ) : items.length === 0 ? (
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
        <>
        {/* 데스크톱: 1101px 초과 시 기존 테이블 + OrderSummary */}
        <div className="hidden min-[1101px]:flex flex-row items-start gap-6">
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl p-2 sm:p-4">
            <div className="overflow-x-hidden overflow-y-auto" style={{ maxHeight: "clamp(560px, 39.8vw, 760px)" }}>
              <table className="cart-table w-full" style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed", minWidth: 0 }}>
                <thead className="sticky top-0 z-10 bg-background-peach">
                  <tr className="bg-background-peach">
                    <th className="py-6 pl-4 pr-2 sm:py-11 sm:pl-10 sm:pr-6" style={{ width: "47.4%" }}>
                      <div className="flex items-center" style={{ marginLeft: "calc(clamp(2rem, 8.33vw, 10rem) - 120px)", gap: "clamp(8px, 1.67vw, 32px)" }}>
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
                          <div className="flex min-w-0 flex-1 items-start" style={{ marginLeft: "calc(clamp(2rem, 8.33vw, 10rem) - 120px)", gap: "clamp(8px, 0.83vw, 16px)" }}>
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
                          onClick={async () => {
                            try {
                              await removeItem(item.id);
                              toast.success("상품이 삭제되었습니다.");
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
                            }
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
                              height: "clamp(46px, 3.5vw, 54px)",
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
                                style={{ minWidth: "clamp(1.25rem, 1.67vw, 2rem)", minHeight: "clamp(1.25rem, 1.67vw, 2rem)", width: "clamp(1.25rem, 1.67vw, 2rem)", height: "clamp(1.25rem, 1.67vw, 2rem)" }}
                                aria-label="수량 증가"
                              >
                                <Image src="/upsemo.png" alt="수량 증가" width={13} height={13} className="object-contain" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item, -1)}
                                className="flex items-center justify-center text-primary-400 transition-colors hover:opacity-80"
                                style={{ minWidth: "clamp(1.25rem, 1.67vw, 2rem)", minHeight: "clamp(1.25rem, 1.67vw, 2rem)", width: "clamp(1.25rem, 1.67vw, 2rem)", height: "clamp(1.25rem, 1.67vw, 2rem)", marginTop: "-14px" }}
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
                          className="text-xl-sb rounded-full text-white transition-colors hover:bg-primary-300"
                          style={{
                            width: "clamp(100px, 6.82vw, 131px)",
                            height: "clamp(44px, 2.6vw, 50px)",
                            marginTop: "20px",
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
                  <tr>
                    <td colSpan={4} className="border-t border-line-gray" style={{ height: 0, padding: 0, lineHeight: 0 }} />
                  </tr>
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

        {/* 1100px 이하: 태블릿/모바일 카드 레이아웃 */}
        <div className="flex min-[1101px]:hidden flex-col gap-6">
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={items.length > 0 && selectedIds.size === items.length}
                onChange={toggleSelectAll}
                className="cart-checkbox h-5 w-5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
              />
              <span className="text-base text-black-400">전체 선택</span>
            </label>
            <div className="ml-6 flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAll}
                className="rounded-full border border-gray-200 bg-background-peach px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100/80"
              >
                전체 상품 삭제
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="rounded-full border border-gray-200 bg-background-peach px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100/80"
              >
                선택 상품 삭제
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 py-4"
              >
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="cart-checkbox mt-1 h-4 w-4 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                  />
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-base font-medium text-black-400">
                      {item.title || "상품"}
                    </p>
                    <p className="mt-1 text-right text-lg font-bold text-black-400">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex w-[120px] min-w-0 shrink-0 items-center gap-0.5 rounded-2xl border border-primary-300 bg-white px-2 py-1 sm:w-[160px] sm:gap-1 sm:px-3 sm:py-1.5 min-[400px]:w-[200px]">
                        <span className="min-w-[1.5rem] flex-1 text-right text-xs text-primary-400 sm:min-w-[2rem] sm:text-sm">
                          {item.quantity} 개
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, 1)}
                            className="flex items-center justify-center text-primary-400 hover:opacity-80"
                            aria-label="수량 증가"
                          >
                            <Image src="/upsemo.png" alt="" width={12} height={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, -1)}
                            className="flex items-center justify-center text-primary-400 hover:opacity-80"
                            aria-label="수량 감소"
                          >
                            <Image src="/downsemo.png" alt="" width={12} height={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInstantRequest(item)}
                        className="w-[120px] shrink-0 rounded-full bg-primary-400 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-300 sm:w-[160px] sm:px-4 sm:py-2 sm:text-sm min-[400px]:w-[200px]"
                      >
                        즉시 요청
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await removeItem(item.id);
                        toast.success("상품이 삭제되었습니다.");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
                      }
                    }}
                    className="shrink-0 p-1 text-gray-400 hover:text-black-400"
                    aria-label="삭제"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="border-t border-line-gray pt-3 text-sm">
                  <p className="mb-1 font-medium text-black-400">주문금액</p>
                  <p className="flex justify-between text-gray-500">
                    <span>상품금액(총 {item.quantity}개)</span>
                    <span className="text-right">{formatPrice(item.price * item.quantity)}</span>
                  </p>
                  <p className="flex justify-between text-gray-500">
                    <span>배송비</span>
                    <span className="text-right">{formatPrice(DELIVERY_FEE)}</span>
                  </p>
                  <p className="flex justify-between text-gray-500">
                    <span>배송수단</span>
                    <span className="text-right">택배</span>
                  </p>
                </div>
              </div>
            ))}
          <div className="border-t border-line-gray" />
          </div>

          <div className="border-t border-line-gray pt-4">
            <div className="flex justify-between py-3 text-base text-black-400">
              <span>총 주문 상품</span>
              <span className="text-right font-bold text-primary-400">{totalQuantity}개</span>
            </div>
            <div className="flex justify-between py-3 text-base text-gray-500">
              <span>상품 금액</span>
              <span className="text-right font-semibold text-black-400">{formatPrice(productAmount)}</span>
            </div>
            <div className="flex justify-between py-3 text-base text-gray-500">
              <span>배송비</span>
              <span className="text-right font-semibold text-black-400">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-line-gray py-3 text-base font-bold">
              <span className="text-black-400">총 주문금액</span>
              <span className="text-right text-primary-400">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between py-3 text-sm text-gray-500">
              <span>남은 예산 금액</span>
              <span className="text-right">—</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/items"
              className="flex h-12 w-[340px] shrink-0 items-center justify-center rounded-xl bg-[#FDF0DF] font-semibold text-primary-400"
            >
              계속 쇼핑하기
            </Link>
            <button
              type="button"
              onClick={handlePurchaseRequest}
              className="h-12 w-[340px] shrink-0 rounded-xl bg-primary-400 font-semibold text-white transition-colors hover:bg-primary-300"
            >
              구매 요청
            </button>
          </div>
        </div>
        </>
      )}

      {/* 데스크톱 전용: 하단 삭제 버튼 */}
      <div className="hidden gap-3 bg-[#FBF8F4] px-0 py-2 pl-6 min-[1101px]:flex sm:py-3">
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