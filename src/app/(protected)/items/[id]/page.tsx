"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category_main: string;
  category_sub: string;
  link?: string;
  count?: number;
  user?: {
    company_name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/items/${productId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("상품을 불러올 수 없습니다");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("상품 조회 실패:", err);
        setError(err instanceof Error ? err.message : "상품을 불러올 수 없습니다");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[1920px] bg-background-peach px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <p className="text-lg-m text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[1920px] bg-background-peach px-4 py-8">
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <p className="text-lg-m text-gray-400">{error || "상품을 찾을 수 없습니다"}</p>
          <Link href="/items" className="text-primary-400 underline">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1920px] bg-background-peach px-4 py-4 sm:px-6 sm:py-8">
      {/* 브레드크럼 네비게이션 */}
      <nav className="mb-4 flex items-center gap-2 text-sm sm:mb-8 sm:text-base text-md-r text-gray-400">
        <Link href="/" className="hover:text-black-400">
          홈
        </Link>
        <span>&gt;</span>
        <Link href="/items" className="hover:text-black-400">
          {product.category_main}
        </Link>
        <span>&gt;</span>
        <span className="text-black-400">{product.category_sub}</span>
      </nav>

      {/* 메인 콘텐츠 - 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        {/* 좌측: 상품 이미지 */}
        <div className="flex items-start justify-center">
          <div className="aspect-square w-full max-w-[600px] rounded-xl sm:rounded-2xl bg-white p-6 sm:p-12">
            {product.image ? (
              <div className="relative h-full w-full">
                <Image 
                  src={product.image} 
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm sm:text-base text-gray-400">
                {product.title}
              </div>
            )}
          </div>
        </div>

        {/* 우측: 상품 정보 */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* 카테고리 */}
          <p className="text-md-m sm:text-lg-m text-gray-400">{product.category_sub}</p>

          {/* 상품명 */}
          <h1 className="text-2xl-b sm:text-3xl-b text-black-500">
            {product.title}
          </h1>

          {/* 판매자 정보 */}
          {product.user?.company_name && (
            <div className="inline-flex w-fit items-center rounded bg-primary-100 px-3 py-1">
              <span className="text-sm sm:text-md-sb text-primary-400">
                {product.user.company_name}
              </span>
            </div>
          )}

          {/* 가격 */}
          <div className="border-t border-line-gray pt-4 sm:pt-6">
            <p className="text-2xl-b sm:text-3xl-b text-black-500">
              {product.price.toLocaleString()}원
            </p>
          </div>

          {/* 상품 링크 */}
          {product.link && (
            <div className="flex flex-col gap-3 sm:gap-4 border-t border-line-gray pt-4 sm:pt-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="w-20 sm:w-24 flex-shrink-0 text-md-m sm:text-lg-m text-black-300">
                  제품링크
                </span>
                <a 
                  href={product.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-md-r sm:text-lg-r text-primary-400 hover:underline break-all"
                >
                  {product.link}
                </a>
              </div>
            </div>
          )}

          {/* TODO: 수량 선택 및 장바구니 담기 버튼 추가 */}
          {/* 
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-lg-m">수량</span>
              <div className="flex items-center gap-2">
                <button className="...">-</button>
                <input type="number" value={1} />
                <button className="...">+</button>
              </div>
            </div>
            <button className="bg-primary-400 text-white ...">
              장바구니 담기
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
