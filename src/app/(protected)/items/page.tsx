"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductModal from "@/components/ProductModal";
import { useModal } from "@/contexts/ModalContext";

// API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// 타입 정의
interface User {
  id: string;
  name: string | null;
  email: string;
  company_name: string;
}

interface Item {
  id: string;
  title: string;
  price: number;
  image: string;
  category_main: string;
  category_sub: string;
  count: number;
  user_id: string;
  create_at: string;
  updated_at: string;
  user?: User;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ItemsResponse {
  data: Item[];
  pagination: Pagination;
}

export default function ItemsPage() {
  const [sortOption, setSortOption] = useState("최신순");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [categoryMain, setCategoryMain] = useState("음료");
  const [categorySub, setCategorySub] = useState("청량·탄산음료");
  const [page, setPage] = useState(1);

  // API 데이터 상태 (타입 명시)
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const { openModal, closeModal } = useModal();

  const sortOptions = ["최신순", "판매순", "낮은가격순", "높은가격순"];

  // API 호출 함수
  const fetchItems = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params = new URLSearchParams({
        category_main: categoryMain,
        category_sub: categorySub,
        sort: sortOption,
        page: currentPage.toString(),
        limit: "8",
      });

      const response = await fetch(`${API_URL}/api/items?${params}`, {
        credentials: "include", // 쿠키 전송
      });

      if (!response.ok) throw new Error("데이터를 불러올 수 없습니다");

      const data: ItemsResponse = await response.json();

      if (resetPage) {
        setItems(data.data); // 새로 시작
        setPage(1);
      } else {
        setItems([...items, ...data.data]); // 기존 데이터에 추가
      }

      setPagination(data.pagination);
    } catch (error) {
      console.error("API 호출 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 & 필터 변경 시 데이터 불러오기
  useEffect(() => {
    fetchItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryMain, categorySub, sortOption]);

  const handleOpenProductModal = () => {
    openModal(<ProductModal onClose={closeModal} />);
  };

  // 더보기 버튼 클릭
  const handleLoadMore = () => {
    setPage(page + 1);
    fetchItems(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1920px] bg-background-peach px-4 sm:px-6 py-6 sm:py-8">
      {/* 카테고리 네비게이션 */}
      <nav className="mb-6 flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto border-b border-line-gray pb-4 scrollbar-hide">
        {["스낵", "음료", "생수", "간편식", "신선식품", "원두커피", "비품"].map(
          (category) => (
            <button
              key={category}
              onClick={() => setCategoryMain(category)}
              className={`whitespace-nowrap text-md-m sm:text-lg-m ${
                categoryMain === category
                  ? "border-b-2 border-primary-400 pb-4 text-md-b sm:text-lg-b text-primary-400"
                  : "text-gray-400"
              }`}
            >
              {category}
            </button>
          ),
        )}
      </nav>

      {/* 서브 카테고리 */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide w-full sm:w-auto">
          {[
            "청량·탄산음료",
            "커피음료",
            "에너지음료",
            "원두커피",
            "건강음료",
          ].map((subCategory) => (
            <button
              key={subCategory}
              onClick={() => setCategorySub(subCategory)}
              className={`whitespace-nowrap text-md-m sm:text-lg-m ${
                categorySub === subCategory
                  ? "text-md-b sm:text-lg-b text-primary-400"
                  : "text-gray-400"
              }`}
            >
              {subCategory}
            </button>
          ))}
        </div>

        {/* 정렬 드롭다운 */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 rounded-lg border border-line-gray bg-white px-3 sm:px-4 py-2 text-sm sm:text-md-m text-black-400"
          >
            {sortOption}
            <svg
              width="12"
              height="12"
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
            <div className="absolute right-0 top-full z-10 mt-2 w-28 sm:w-32 rounded-lg border border-line-gray bg-white shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortOption(option);
                    setShowSortDropdown(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 text-left text-sm sm:text-md-r hover:bg-primary-100"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 로딩 상태 */}
      {loading && items.length === 0 && (
        <div className="flex justify-center py-20">
          <p className="text-lg-m text-gray-400">로딩 중...</p>
        </div>
      )}

      {/* 상품 카드 그리드 */}
      {!loading || items.length > 0 ? (
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="overflow-hidden rounded-2xl transition-transform hover:scale-105"
            >
              <div className="relative aspect-square w-full bg-white">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-md-m text-gray-400">
                    {item.title}
                  </div>
                )}
              </div>
              <div className="p-4 bg-white">
                <h3 className="text-lg-b text-black-400 mb-2">{item.title}</h3>
                <p className="text-md-b text-primary-400">
                  {item.price.toLocaleString()}원
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {item.user?.company_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {/* 상품 없음 */}
      {!loading && items.length === 0 && (
        <div className="flex justify-center py-20">
          <p className="text-lg-m text-gray-400">상품이 없습니다</p>
        </div>
      )}

      {/* 더보기 버튼 */}
      {pagination?.hasNextPage && (
        <div className="flex justify-center px-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="flex h-14 sm:h-16 w-full max-w-[640px] items-center justify-center gap-2 sm:gap-3 rounded-xl border-2 border-primary-400 bg-white text-lg-sb sm:text-2xl-sb text-primary-400 transition-colors hover:bg-primary-100 disabled:opacity-50"
          >
            {loading ? "로딩 중..." : "더보기"}
            <Image
              src="/orangedown.png"
              alt="더보기"
              width={24}
              height={12}
              className="h-2.5 w-5 sm:h-3 sm:w-6"
            />
          </button>
        </div>
      )}

      {/* 플로팅 상품 등록 버튼 */}
      <button
        onClick={handleOpenProductModal}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 flex items-center gap-2 rounded-full bg-illustration-mint px-4 py-3 sm:px-6 sm:py-4 text-md-sb sm:text-lg-sb text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          className="sm:w-5 sm:h-5"
        >
          <path
            d="M10 4V16M4 10H16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="hidden sm:inline">상품 등록</span>
        <span className="sm:hidden">등록</span>
      </button>
    </div>
  );
}
