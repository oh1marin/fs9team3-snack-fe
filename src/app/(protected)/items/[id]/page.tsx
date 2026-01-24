"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

// TODO: API 연동 후 실제 데이터로 교체
const DUMMY_PRODUCT = {
  id: 1,
  category: "청량·탄산음료",
  name: "코카콜라 제로",
  price: 2000,
  purchaseCount: 29,
  points: 5,
  shippingMethod: "택배",
  shippingFee: 3000,
  freeShippingThreshold: 50000,
  // image: "/product-image.png", // API에서 받아올 예정
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;

  // TODO: productId로 API 호출하여 상품 정보 가져오기
  // const { data: product } = useProduct(productId);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1920px] bg-background-peach px-4 py-4 sm:px-6 sm:py-8">
      {/* 브레드크럼 네비게이션 */}
      <nav className="mb-4 flex items-center gap-2 text-sm sm:mb-8 sm:text-base text-md-r text-gray-400">
        <Link href="/" className="hover:text-black-400">
          홈
        </Link>
        <span>&gt;</span>
        <Link href="/items" className="hover:text-black-400">
          음료
        </Link>
        <span>&gt;</span>
        <span className="text-black-400">{DUMMY_PRODUCT.category}</span>
      </nav>

      {/* 메인 콘텐츠 - 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        {/* 좌측: 상품 이미지 */}
        <div className="flex items-start justify-center">
          <div className="aspect-square w-full max-w-[600px] rounded-xl sm:rounded-2xl bg-white p-6 sm:p-12">
            {/* TODO: API에서 이미지 URL 받아와서 표시 */}
            {/* <Image 
              src={product.image} 
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-contain"
            /> */}
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm sm:text-base text-gray-400">
              상품 이미지 (API 연동 필요)
            </div>
          </div>
        </div>

        {/* 우측: 상품 정보 */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* 카테고리 */}
          <p className="text-md-m sm:text-lg-m text-gray-400">{DUMMY_PRODUCT.category}</p>

          {/* 상품명 */}
          <h1 className="text-2xl-b sm:text-3xl-b text-black-500">
            {DUMMY_PRODUCT.name}
          </h1>

          {/* 구매 횟수 배지 */}
          <div className="inline-flex w-fit items-center rounded bg-primary-100 px-3 py-1">
            <span className="text-sm sm:text-md-sb text-primary-400">
              {DUMMY_PRODUCT.purchaseCount}회 구매
            </span>
          </div>

          {/* 가격 */}
          <div className="border-t border-line-gray pt-4 sm:pt-6">
            <p className="text-2xl-b sm:text-3xl-b text-black-500">
              {DUMMY_PRODUCT.price.toLocaleString()}원
            </p>
          </div>

          {/* 상품 상세 정보 */}
          <div className="flex flex-col gap-3 sm:gap-4 border-t border-line-gray pt-4 sm:pt-6">
            {/* 구매혜택 */}
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-20 sm:w-24 flex-shrink-0 text-md-m sm:text-lg-m text-black-300">
                구매혜택
              </span>
              <span className="text-md-r sm:text-lg-r text-black-500">
                {DUMMY_PRODUCT.points}포인트 적립 예정
              </span>
            </div>

            {/* 배송방법 */}
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-20 sm:w-24 flex-shrink-0 text-md-m sm:text-lg-m text-black-300">
                배송방법
              </span>
              <span className="text-md-r sm:text-lg-r text-black-500">
                {DUMMY_PRODUCT.shippingMethod}
              </span>
            </div>

            {/* 배송비 */}
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="w-20 sm:w-24 flex-shrink-0 text-md-m sm:text-lg-m text-black-300">
                배송비
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-md-r sm:text-lg-r text-black-500">
                  {DUMMY_PRODUCT.shippingFee.toLocaleString()}원(
                  {DUMMY_PRODUCT.freeShippingThreshold.toLocaleString()}원 이상
                  무료배송)
                </span>
                <span className="text-sm sm:text-md-r text-gray-400">
                  도서산간 배송비 추가
                </span>
              </div>
            </div>
          </div>

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
