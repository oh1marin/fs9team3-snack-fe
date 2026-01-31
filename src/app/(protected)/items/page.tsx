"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductModal from "@/components/ProductModal";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useModal } from "@/contexts/ModalContext";
import SortButton from "@/app/ui/SortButton";
import AddProductBtn from "@/app/ui/AddProductBtn";

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
  // API 데이터 상태 (타입 명시)
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const { openModal, closeModal } = useModal();

  const sortOptions = ["최신순", "판매순", "낮은가격순", "높은가격순"];

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL 쿼리 → 초기 state (상세에서 돌아올 때 정렬/카테고리 유지)
  const sortFromUrl = searchParams.get("sort");
  const mainFromUrl = searchParams.get("main");
  const subFromUrl = searchParams.get("sub");
  const [sortOption, setSortOption] = useState(() =>
    sortFromUrl && sortOptions.includes(sortFromUrl) ? sortFromUrl : "최신순"
  );
  const [categoryMain, setCategoryMain] = useState(mainFromUrl || "음료");
  const [categorySub, setCategorySub] = useState(subFromUrl || "청량·탄산음료");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [page, setPage] = useState(1);

  // URL이 바뀌었을 때(뒤로가기 등) state 동기화
  useEffect(() => {
    const s = searchParams.get("sort");
    const m = searchParams.get("main");
    const n = searchParams.get("sub");
    if (s && sortOptions.includes(s)) setSortOption(s);
    if (m) setCategoryMain(m);
    if (n) setCategorySub(n);
  }, [searchParams]);

  // 정렬/카테고리 변경 시 URL 업데이트 (replace로 히스토리 한 칸만)
  const updateListUrl = useCallback(
    (updates: { sort?: string; main?: string; sub?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.sort !== undefined) (updates.sort ? params.set("sort", updates.sort) : params.delete("sort"));
      if (updates.main !== undefined) (updates.main ? params.set("main", updates.main) : params.delete("main"));
      if (updates.sub !== undefined) (updates.sub ? params.set("sub", updates.sub) : params.delete("sub"));
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router]
  );

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API 에러 응답:", errorText);
        throw new Error(`데이터를 불러올 수 없습니다 (${response.status}): ${errorText}`);
      }

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
    openModal(
      <ProductModal 
        onClose={closeModal} 
        onSuccess={() => fetchItems(true)} 
      />
    );
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
              onClick={() => {
                setCategoryMain(category);
                updateListUrl({ main: category });
              }}
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
                  onClick={() => {
                    setCategorySub(subCategory);
                    updateListUrl({ sub: subCategory });
                  }}
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
          <SortButton sortOption={sortOption} setShowSortDropdown={setShowSortDropdown} showSortDropdown={showSortDropdown} />

          {showSortDropdown && (
            <div className="absolute right-0 top-full z-10 mt-2 w-28 sm:w-32 rounded-lg border border-line-gray bg-white shadow-lg">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortOption(option);
                    setShowSortDropdown(false);
                    updateListUrl({ sort: option });
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

      {/* 로딩 스켈레톤 (첫 로딩 시) */}
      {loading && items.length === 0 && (
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 상품 카드 그리드 */}
      {(!loading || items.length > 0) && (
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl">
              <Link
                href={`/items/${item.id}?from=${encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)}`}
                className="block transition-transform hover:scale-105"
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
              </Link>
              <div className="p-4 bg-background-peach pointer-events-none">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-400">
                    {item.category_sub}
                  </p>
                  <span 
                    className="px-2 py-1 rounded text-primary-400 text-xs font-semibold"
                    style={{ backgroundColor: '#FEE8B0' }}
                  >
                    {item.count}회 구매
                  </span>
                </div>
                <h3 className="text-lg-b text-black-400 mb-2">{item.title}</h3>
                <p className="text-md-b text-primary-400">
                  {item.price.toLocaleString()}원
                </p>
                {item.user?.company_name && (
                  <p className="text-sm text-gray-400 mt-1">
                    {item.user.company_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
      <AddProductBtn onClick={handleOpenProductModal} />
    </div>
  );
}
