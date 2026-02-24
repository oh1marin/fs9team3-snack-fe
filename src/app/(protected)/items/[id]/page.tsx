"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/contexts/ModalContext";
import { toast } from "react-toastify";
import { getClientAccessToken } from "@/lib/api/authToken";
import { getImageSrc } from "@/lib/utils/image";
import { getPurchaseBadgeText } from "@/lib/utils/purchaseBadge";

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
  const router = useRouter();
  const productId = params.id;
  const listReturnUrl = searchParams.get("from") || "/items";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const { openModal, closeModal } = useModal();
  const { addToCart } = useCart();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = getClientAccessToken();
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_URL}/api/items/${productId}`, {
        credentials: "include",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          const { handleTokenExpired } =
            await import("@/lib/api/handleTokenExpired");
          handleTokenExpired();
          return;
        }
        throw new Error("상품을 불러올 수 없습니다");
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "상품을 불러올 수 없습니다",
      );
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

  const handleEditProduct = async () => {
    if (!product) return;
    const { default: ProductModal } = await import("@/components/ProductModal");
    openModal(
      <ProductModal
        onClose={closeModal}
        onSuccess={() => fetchProduct()}
        editMode={true}
        product={product}
      />,
    );
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    const { default: DeleteModal } = await import("@/components/DeleteModal");
    openModal(
      <DeleteModal
        itemName={product.title}
        cancelText="더 생각해볼게요"
        onClose={closeModal}
        onConfirm={async () => {
          try {
            const token = getClientAccessToken();

            const response = await fetch(`${API_URL}/api/items/${productId}`, {
              method: "DELETE",
              credentials: "include",
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            if (!response.ok) throw new Error("삭제 실패");

            closeModal();
            toast.success("상품이 삭제되었습니다.");
            router.push("/items");
          } catch {
            toast.error("상품 삭제에 실패했습니다.");
          }
        }}
      />,
    );
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity, {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      });
      const { default: AddToCartModal } =
        await import("@/components/AddToCartModal");
      openModal(
        <AddToCartModal
          onClose={closeModal}
          onGoToCart={() => {
            closeModal();
            router.push("/cart");
          }}
        />,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "장바구니 담기에 실패했습니다.",
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto min-h-96 w-full max-w-[1920px] animate-pulse rounded-2xl bg-gray-200/30 px-4 py-8" />
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[1920px] bg-background-peach px-4 py-8">
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <p className="text-lg-m text-gray-400">
            {error || "상품을 찾을 수 없습니다"}
          </p>
          <Link href={listReturnUrl} className="text-primary-400 underline">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1920px] bg-background-peach px-4 py-4 sm:px-6 sm:py-8">
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

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex items-start justify-center">
          <div className="aspect-square w-full max-w-[600px] rounded-xl sm:rounded-2xl bg-white p-6 sm:p-12">
            {product.image ? (
              <div className="relative h-full w-full">
                <Image
                  src={getImageSrc(product.image)}
                  alt={product.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm sm:text-base text-gray-400">
                {product.title}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <p className="text-md-m sm:text-lg-m text-gray-400">
            {product.category_sub}
          </p>

          <h1 className="text-2xl-b sm:text-3xl-b text-black-500">
            {product.title}
          </h1>

          <div>
            <span
              className="inline-block px-3 py-1.5 rounded text-primary-400 text-sm sm:text-md-sb"
              style={{ backgroundColor: "#FEE8B0" }}
            >
              {getPurchaseBadgeText(product.count ?? 0)}
            </span>
          </div>

          {product.user?.company_name && (
            <div className="inline-flex w-fit items-center rounded bg-primary-100 px-3 py-1">
              <span className="text-sm sm:text-md-sb text-primary-400">
                {product.user.company_name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 sm:pt-6">
            <p className="text-2xl-b sm:text-3xl-b text-black-500">
              {product.price.toLocaleString()}원
            </p>

            {/* 점 3개 메뉴 */}
            {product.isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex flex-col items-center justify-center w-10 h-10 gap-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-20 w-36 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleEditProduct();
                        }}
                        className="w-full px-4 py-3 text-left text-md-r text-black-400 hover:bg-gray-50 transition-colors"
                      >
                        상품 수정
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleDeleteProduct();
                        }}
                        className="w-full px-4 py-3 text-left text-md-r text-red-400 hover:bg-red-50 transition-colors"
                      >
                        상품 삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

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

          <div className="border-t border-line-gray pt-4 sm:pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex shrink-0 items-center justify-end gap-2 px-4 rounded-2xl border-2 border-primary-300 bg-white"
                style={{ width: 200, height: 64 }}
              >
                <span className="min-w-[3.25rem] text-right text-lg-m text-primary-400">
                  {quantity} 개
                </span>
                <div
                  className="flex flex-col items-center justify-center"
                  style={{ gap: 5 }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex items-center justify-center w-8 h-8 text-primary-400 transition-colors hover:opacity-80"
                    aria-label="수량 증가"
                  >
                    <Image
                      src="/upsemo.png"
                      alt="수량 증가"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex items-center justify-center w-8 h-8 text-primary-400 transition-colors hover:opacity-80"
                    aria-label="수량 감소"
                  >
                    <Image
                      src="/downsemo.png"
                      alt="수량 감소"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="h-12 sm:h-14 flex-1 min-w-[200px] rounded-lg sm:rounded-xl bg-primary-400 text-md-sb sm:text-lg-sb text-white transition-colors hover:bg-primary-300"
              >
                장바구니 담기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
