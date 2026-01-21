"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ isOpen, onClose }: ProductModalProps) {
  const [formData, setFormData] = useState({
    productName: "",
    category: "음료",
    subCategory: "청량/탄산 음료",
    price: "",
    productLink: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);

  const categories = [
    "스낵",
    "음료",
    "생수",
    "간편식",
    "신선식품",
    "원두커피",
    "비품",
  ];
  const subCategories = [
    "청량/탄산 음료",
    "커뮤음료",
    "에너지음료",
    "원두커피",
    "건강음료",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출
    console.log("상품 등록:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="h-[1122px] w-[688px] overflow-y-auto border p-12"
        style={{
          borderRadius: "32px",
          backgroundColor: "#FBF8F4",
          boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-10 text-3xl-b text-black-500">상품 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 상품명 */}
          <div>
            <label className="mb-3 block text-2xl-sb text-black-500">
              상품명
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              placeholder="스프라이트 제로"
              className="h-16 w-full rounded-2xl border-2 border-primary-300 bg-white px-6 text-xl-r outline-none placeholder:text-gray-400 focus:border-primary-400"
              required
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="mb-3 block text-2xl-sb text-black-500">
              카테고리
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* 대카테고리 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex h-16 w-full items-center justify-between rounded-2xl border-2 border-primary-300 bg-white px-6 text-xl-r text-primary-400"
                >
                  {formData.category}
                  <Image
                    src="/orangedown.png"
                    alt="dropdown"
                    width={24}
                    height={12}
                    className={`h-3 w-6 transition-transform ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full rounded-xl border-2 border-line-gray bg-white shadow-lg">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat });
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-6 py-3 text-left text-lg-r hover:bg-primary-100"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 소카테고리 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowSubCategoryDropdown(!showSubCategoryDropdown)
                  }
                  className="flex h-16 w-full items-center justify-between rounded-2xl border-2 border-primary-300 bg-white px-6 text-xl-r text-primary-400"
                >
                  {formData.subCategory}
                  <Image
                    src="/orangedown.png"
                    alt="dropdown"
                    width={24}
                    height={12}
                    className={`h-3 w-6 transition-transform ${
                      showSubCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSubCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full rounded-xl border-2 border-line-gray bg-white shadow-lg">
                    {subCategories.map((subCat) => (
                      <button
                        key={subCat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, subCategory: subCat });
                          setShowSubCategoryDropdown(false);
                        }}
                        className="w-full px-6 py-3 text-left text-lg-r hover:bg-primary-100"
                      >
                        {subCat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 가격 */}
          <div>
            <label className="mb-3 block text-2xl-sb text-black-500">
              가격
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="1,900"
              className="h-16 w-full rounded-2xl border-2 border-primary-300 bg-white px-6 text-xl-r outline-none placeholder:text-gray-400 focus:border-primary-400"
              required
            />
          </div>

          {/* 상품 이미지 */}
          <div>
            <label className="mb-3 block text-2xl-sb text-black-500">
              상품 이미지
            </label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative h-48 w-48 overflow-hidden rounded-2xl bg-gray-200">
                  <Image
                    src={imagePreview}
                    alt="상품 이미지"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-gray-200">
                  <span className="text-gray-400">이미지 없음</span>
                </div>
              )}

              <label className="flex h-48 w-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-colors hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-center">
                  <div className="mb-2 text-4xl text-gray-400">+</div>
                  <div className="text-md-r text-gray-400">이미지 업로드</div>
                </div>
              </label>
            </div>
          </div>

          {/* 제품링크 */}
          <div>
            <label className="mb-3 block text-2xl-sb text-black-500">
              제품링크
            </label>
            <input
              type="url"
              value={formData.productLink}
              onChange={(e) =>
                setFormData({ ...formData, productLink: e.target.value })
              }
              placeholder="www.codeit"
              className="h-16 w-full rounded-2xl border-2 border-primary-300 bg-white px-6 text-xl-r outline-none placeholder:text-gray-400 focus:border-primary-400"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-16 flex-1 rounded-2xl border-2 border-primary-300 bg-white text-xl-sb text-primary-400 transition-colors hover:bg-primary-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-16 flex-1 rounded-2xl bg-primary-400 text-xl-sb text-white transition-colors hover:bg-primary-300"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
