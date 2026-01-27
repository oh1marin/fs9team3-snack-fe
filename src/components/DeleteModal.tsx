"use client";

import Image from "next/image";

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export default function DeleteModal({ onClose, onConfirm, itemName }: DeleteModalProps) {
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
          height: "480px",
          borderRadius: "24px",
          backgroundColor: "#FBF8F4",
          boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
        }}
      >
        {/* 개 이미지 */}
        <div>
          <Image
            src="/DOG!.png"
            alt="삭제 확인"
            width={230}
            height={196}
          />
        </div>

        {/* 제목 */}
        <h2 className="text-2xl-b sm:text-3xl-b text-black-500">상품 삭제</h2>
        
        {/* 설명 */}
        <div className="text-center">
          <p className="text-lg-m sm:text-xl-m text-gray-400">
            <span className="font-bold">{itemName || "코카콜라"}</span> 상품을 삭제할까요?
          </p>
          <p className="text-md-r sm:text-lg-r text-gray-400">
            상품 삭제 후에는 복구할 수 없어요!
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 justify-center w-full mt-auto">
          <button
            onClick={onClose}
            className="text-lg-sb transition-colors"
            style={{
              width: "310px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#FDF0DF",
              color: "#FF8A3D"
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="text-lg-sb text-white transition-colors hover:opacity-90"
            style={{
              width: "310px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#FF8A3D"
            }}
          >
            삭제할래요
          </button>
        </div>
      </div>
    </div>
  );
}
