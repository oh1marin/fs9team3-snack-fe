"use client";

import Link from "next/link";

export default function ItemsRegisterPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1920px] flex-col overflow-x-hidden bg-background-peach px-4 py-8 sm:px-6">
      <h1
        className="mb-8 text-2xl font-bold text-black-400"
        style={{ marginLeft: "clamp(2rem, 8.33vw, 10rem)" }}
      >
        상품 등록 내역
      </h1>

      <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center rounded-2xl bg-background-peach py-16 text-center">
        <p className="mb-4 text-lg text-gray-400">
          아직 등록한 상품이 없습니다.
        </p>
        <p className="mb-6 text-sm text-gray-400">
          상품을 등록하시면 여기에 내역이 표시됩니다.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/items"
            className="rounded-xl bg-primary-400 px-6 py-3 text-md-sb text-white transition-colors hover:bg-primary-300"
          >
            상품 리스트
          </Link>
        </div>
      </div>
    </main>
  );
}
