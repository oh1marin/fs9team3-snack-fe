"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import {
  fetchOrderDetail,
  formatRequestDate,
  type OrderDetail,
} from "@/lib/api/orders";
import { toast } from "react-toastify";
import Image from "next/image";
import { getImageSrc } from "@/lib/utils/image";

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { addToCart } = useCart();
  const [data, setData] = useState<OrderDetail | null | undefined>(undefined);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    let cancelled = false;
    fetchOrderDetail(id).then((res) => {
      if (!cancelled) setData(res ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!data?.items?.length) return;
    const validItems = data.items.filter((it) => it.itemId);
    if (validItems.length === 0) {
      toast.error("담을 수 있는 상품이 없습니다.");
      return;
    }
    try {
      setAddingToCart(true);
      for (const it of validItems) {
        await addToCart(it.itemId, it.quantity, {
          id: it.itemId,
          itemId: it.itemId,
          title: it.name,
          price: it.unitPrice,
          image: it.image,
        });
      }
      toast.success("장바구니에 담았어요!");
      router.push("/cart");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "장바구니 담기에 실패했습니다.",
      );
    } finally {
      setAddingToCart(false);
    }
  };

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
          href="/orders"
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
            구매 요청 내역
          </h1>
          <h2 className="mb-2 text-lg font-semibold text-black-400">
            요청 품목
          </h2>
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
                key={idx}
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
                    {item.unitPrice.toLocaleString("ko-KR")}원
                  </p>
                  <p className="mt-1 font-medium text-black-400">
                    {formatPrice(item.totalPrice)}
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
                {data.totalAmount.toLocaleString("ko-KR")}원
              </span>
            </p>
          </div>
          <div
            className="flex flex-nowrap items-center gap-4"
            style={{ width: "1041px", maxWidth: "100%" }}
          >
            <Link
              href="/orders"
              className="flex flex-1 items-center justify-center rounded-2xl bg-[#FDF0DF] py-4 text-base font-semibold text-primary-400 transition-colors hover:bg-primary-200/50"
              style={{ minHeight: 64 }}
            >
              목록 보기
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex flex-1 items-center justify-center rounded-2xl bg-primary-400 py-4 text-base font-medium text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              style={{ minHeight: 64 }}
            >
              {addingToCart ? "담는 중..." : "장바구니에 다시 담기"}
            </button>
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
              승인 정보
            </h3>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">
                {data.status === "구매 반려" ? "반려일" : "승인일"}
              </label>
              <p className="mt-1.5 text-base text-black-400">
                {formatRequestDate(data.approvalDate)}
              </p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">
                상태
              </label>
              <input
                type="text"
                readOnly
                value={data.status}
                className="mt-1.5 w-full rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">
                {data.status === "구매 반려" ? "반려 메시지" : "승인 메시지"}
              </label>
              <textarea
                readOnly
                rows={4}
                value={
                  data.status === "구매 반려"
                    ? "다른 상품들도 더 추가하여 구매요청 부탁드립니다."
                    : "재고가 얼마 남지 않아 승인합니다."
                }
                className="mt-1.5 w-full resize-none rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
