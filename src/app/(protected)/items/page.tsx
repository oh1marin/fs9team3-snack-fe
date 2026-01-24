"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductModal from "@/components/ProductModal";

// 더미 데이터 (나중에 API로 교체)
const DUMMY_PRODUCTS = Array(8)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    image: "/cocacola.png",
  }));

export default function ItemsPage() {
  const [sortOption, setSortOption] = useState("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortOptions = ["최신순", "판매순", "낮은가격순", "높은가격순"];

  return (
    <div className="mx-auto w-full max-w-[1920px] bg-background-peach px-6 py-8">
      {/* 카테고리 네비게이션 */}
      <nav className="mb-6 flex gap-8 border-b border-line-gray pb-4">
        <button className="text-lg-m text-gray-400">스낵</button>
        <button className="border-b-2 border-primary-400 pb-4 text-lg-b text-primary-400">
          음료
        </button>
        <button className="text-lg-m text-gray-400">생수</button>
        <button className="text-lg-m text-gray-400">간편식</button>
        <button className="text-lg-m text-gray-400">신선식품</button>
        <button className="text-lg-m text-gray-400">원두커피</button>
        <button className="text-lg-m text-gray-400">비품</button>
      </nav>

      {/* 서브 카테고리 */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-6">
          <button className="text-lg-b text-primary-400">청량·탄산음료</button>
          <button className="text-lg-m text-gray-400">커뮤음료</button>
          <button className="text-lg-m text-gray-400">에너지음료</button>
          <button className="text-lg-m text-gray-400">원두커피</button>
          <button className="text-lg-m text-gray-400">건강음료</button>
        </div>

        {/* 정렬 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 rounded-lg border border-line-gray bg-white px-4 py-2 text-md-m text-black-400"
          >
            {sortOption}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform ${
                showSortDropdown ? "rotate-180" : ""
              }`}
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
            <div className="absolute right-0 top-full z-10 mt-2 w-32 rounded-lg border border-line-gray bg-white shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortOption(option);
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-md-r hover:bg-primary-100"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 상품 카드 그리드 */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {DUMMY_PRODUCTS.map((product) => (
          <Link
            key={product.id}
            href={`/items/${product.id}`}
            className="overflow-hidden rounded-2xl transition-transform hover:scale-105"
          >
            <div className="relative aspect-square w-full bg-gray-100">
              {/* 이미지는 API에서 받아올 예정 */}
              <div className="flex h-full items-center justify-center text-md-m text-gray-400">
                상품 {product.id}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div className="flex justify-center">
        <button className="flex h-16 w-[640px] items-center justify-center gap-3 rounded-xl border-2 border-primary-400 bg-white text-2xl-sb text-primary-400 transition-colors hover:bg-primary-100">
          더보기
          <Image
            src="/orangedown.png"
            alt="더보기"
            width={24}
            height={12}
            className="h-3 w-6"
          />
        </button>
      </div>

      {/* 플로팅 상품 등록 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-illustration-mint px-6 py-4 text-lg-sb text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 4V16M4 10H16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        상품 등록
      </button>

      {/* 모달 */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
