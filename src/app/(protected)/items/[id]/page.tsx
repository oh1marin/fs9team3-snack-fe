"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductModal from "@/components/ProductModal";
import DeleteModal from "@/components/DeleteModal";
import { useModal } from "@/contexts/ModalContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
  isOwner?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id;
  const router = useRouter();
  const listReturnUrl = searchParams.get("from") || "/items";
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { openModal, closeModal } = useModal();

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

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleEditProduct = () => {
    if (product) {
      openModal(
        <ProductModal 
          onClose={closeModal} 
          onSuccess={() => {
            fetchProduct();
          }}
          editMode={true}
          product={product}
        />
      );
    }
  };

  const handleDeleteProduct = () => {
    if (product) {
      openModal(
        <DeleteModal
          onClose={closeModal}
          onConfirm={async () => {
            try {
              const response = await fetch(`${API_URL}/api/items/${productId}`, {
                method: "DELETE",
                credentials: "include",
              });

              if (!response.ok) {
                throw new Error("상품 삭제에 실패했습니다");
              }

              toast.success("상품이 삭제되었습니다");
              closeModal();
              router.push(listReturnUrl);
            } catch (error) {
              console.error("상품 삭제 실패:", error);
              toast.error("상품 삭제에 실패했습니다");
            }
          }}
          itemName={product.title}
        />
      );
    }
  };

  const handleAddToCart = () => {
    // TODO: 장바구니 기능 구현
    toast.success("장바구니에 담겼습니다!");
  };

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
          <Link href={listReturnUrl} className="text-primary-400 underline">
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
        <Link href={listReturnUrl} className="hover:text-black-400">
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

          {/* 구매 횟수 뱃지 */}
          <div>
            <span 
              className="inline-block px-3 py-1.5 rounded text-primary-400 text-sm sm:text-md-sb"
              style={{ backgroundColor: '#FEE8B0' }}
            >
              {product.count || 0}회 구매
            </span>
          </div>

          {/* 판매자 정보 */}
          {product.user?.company_name && (
            <div className="inline-flex w-fit items-center rounded bg-primary-100 px-3 py-1">
              <span className="text-sm sm:text-md-sb text-primary-400">
                {product.user.company_name}
              </span>
            </div>
          )}

          {/* 가격 */}
          <div className="flex items-center justify-between pt-4 sm:pt-6">
            <p className="text-2xl-b sm:text-3xl-b text-black-500">
              {product.price.toLocaleString()}원
            </p>
            {product.isOwner && (
              <button
                onClick={handleEditProduct}
                className="px-4 py-2 rounded-lg border-2 border-primary-300 bg-white text-md-sb text-primary-400 transition-colors hover:bg-primary-100"
              >
                상품 수정
              </button>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col gap-3 sm:gap-4 border-t border-line-gray pt-4 sm:pt-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-20 sm:w-24 flex-shrink-0 text-md-m sm:text-lg-m text-black-300">
                구매혜택
              </span>
              <span className="text-md-r sm:text-lg-r text-black-400">
                5포인트 적립 예정
              </span>
            </div>
            
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-20 sm:w-24 flex-shrink-0 text-md-m sm:text-lg-m text-black-300">
                배송방법
              </span>
              <span className="text-md-r sm:text-lg-r text-black-400">
                택배
              </span>
            </div>
            
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-20 sm:w-24 flex-shrink-0 text-md-m sm:text-lg-m text-black-300">
                배송비
              </span>
              <span className="text-md-r sm:text-lg-r text-black-400">
                3,000원(50,000원 이상 무료배송) | 도서산간 배송비 추가
              </span>
            </div>
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

          {/* 버튼 영역 */}
          <div className="border-t border-line-gray pt-4 sm:pt-6">
            <div className="flex gap-3">
              {product.isOwner ? (
                <>
                  <button
                    onClick={handleDeleteProduct}
                    className="h-12 sm:h-14 flex-[1] rounded-lg sm:rounded-xl border-2 border-primary-400 bg-white text-md-sb sm:text-lg-sb text-primary-400 transition-colors hover:bg-primary-50"
                  >
                    삭제하기
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="h-12 sm:h-14 flex-[2] rounded-lg sm:rounded-xl bg-primary-400 text-md-sb sm:text-lg-sb text-white transition-colors hover:bg-primary-300"
                  >
                    장바구니 담기
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="h-12 sm:h-14 w-full rounded-lg sm:rounded-xl bg-primary-400 text-md-sb sm:text-lg-sb text-white transition-colors hover:bg-primary-300"
                >
                  장바구니 담기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
