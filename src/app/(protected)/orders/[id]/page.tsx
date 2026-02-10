"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { fetchOrderDetail, formatRequestDate, type OrderDetail } from "@/lib/api/orders";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

/** 상품 리스트/장바구니와 동일: 상대 경로면 API 기준 URL로 변환 */
function getImageSrc(image: string): string {
  if (!image || !image.trim()) return "";
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("//")) {
    return image.trim();
  }
  const base = API_URL.replace(/\/$/, "");
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${base}${path}`;
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<OrderDetail | null | undefined>(undefined);

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
        {/* 왼쪽: 요청 품목 - lg에서 1041px 고정해서 오른쪽 블록과 간격 확실히 적용 */}
        <section className="min-w-0 flex-1 lg:w-[1041px] lg:flex-none">
          <h1 className="mb-2 text-2xl font-bold text-black-400">
            구매 요청 내역
          </h1>
          <h2 className="mb-4 text-lg font-semibold text-black-400">
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
                총 {data.totalCount}건{" "}
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
          <div className="flex flex-nowrap items-center gap-4" style={{ width: "1041px", maxWidth: "100%" }}>
            <Link
              href="/orders"
              className="flex shrink-0 items-center justify-center rounded-xl bg-[#FDF0DF] text-base font-semibold text-primary-400 transition-colors hover:bg-primary-200/50"
              style={{ width: 509, height: 64 }}
            >
              목록 보기
            </Link>
            <Link
              href="/cart"
              className="flex shrink-0 items-center justify-center rounded-xl bg-primary-400 text-base font-medium text-white transition-colors hover:bg-primary-300"
              style={{ width: 509, height: 64 }}
            >
              장바구니에 다시 담기
            </Link>
          </div>
        </section>

        {/* 오른쪽: 요청 정보 / 승인 정보 - 구분선만 */}
        <aside className="w-full shrink-0 lg:w-[380px]">
          <div className="border-b border-line-gray bg-background-peach p-6">
            <h3 className="border-b border-line-gray pb-3 text-base font-semibold text-black-400">
              요청 정보
            </h3>
            <p className="mt-4 text-base text-black-400">{formatRequestDate(data.requestDate)}</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">
                요청인
              </label>
              <input
                type="text"
                readOnly
                value={data.requester}
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
                value={data.requestMessage}
                className="mt-1.5 w-full resize-none rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
              />
            </div>
          </div>

          <div className="mt-6 border-b border-line-gray bg-background-peach p-6">
            <h3 className="border-b border-line-gray pb-3 text-base font-semibold text-black-400">
              승인 정보
            </h3>
            <p className="mt-4 text-base text-black-400">{formatRequestDate(data.approvalDate)}</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600">
                담당자
              </label>
              <input
                type="text"
                readOnly
                value={data.approver}
                className="mt-1.5 w-full rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
              />
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
                결과 메시지
              </label>
              <textarea
                readOnly
                rows={4}
                value={data.resultMessage}
                className="mt-1.5 w-full resize-none rounded-lg border border-line-gray bg-background-peach px-4 py-3 text-base text-black-400"
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
