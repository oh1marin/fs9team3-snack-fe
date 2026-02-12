"use client";

import { useRouter } from "next/navigation";

interface AddToCartModalProps {
  onClose: () => void;
  onGoToCart: () => void;
}

export default function AddToCartModal({ onClose, onGoToCart }: AddToCartModalProps) {
  const router = useRouter();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="border"
        style={{
          display: "inline-flex",
          padding: "16px 32px 32px",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "20px",
          width: "640px",
          maxWidth: "100%",
          minHeight: "280px",
          borderRadius: "24px",
          backgroundColor: "#FBF8F4",
          boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
        }}
      >
        <h2 className="text-2xl-b sm:text-3xl-b text-black-500">장바구니에 담았어요</h2>

        <p className="text-lg-m sm:text-xl-m text-gray-400 text-center">
          더 담으시겠어요? 아니면 장바구니로 이동할까요?
        </p>

        <div className="flex gap-3 justify-center w-full mt-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/items");
            }}
            className="text-lg-sb transition-colors hover:opacity-90"
            style={{
              width: "100%",
              maxWidth: "310px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#FDF0DF",
              color: "#FF8A3D",
            }}
          >
            상품 더 담기
          </button>
          <button
            type="button"
            onClick={onGoToCart}
            className="text-lg-sb text-white transition-colors hover:opacity-90"
            style={{
              width: "100%",
              maxWidth: "310px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#FF8A3D",
            }}
          >
            장바구니 바로가기
          </button>
        </div>
      </div>
    </div>
  );
}
