"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";

interface ProductModalProps {
  onClose: () => void;
}

export default function ProductModal({ onClose }: ProductModalProps) {
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

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-4 sm:mb-6 text-xl-b sm:text-2xl-b text-black-500">상품 등록</h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* 상품명 */}
          <div>
            <label className="mb-1.5 sm:mb-2 block text-md-sb sm:text-lg-sb text-black-500">
              상품명
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              placeholder="스프라이트 제로"
              className="h-12 sm:h-14 w-full rounded-lg sm:rounded-xl border-2 border-primary-300 bg-white px-4 sm:px-5 text-md-r sm:text-lg-r outline-none placeholder:text-gray-400 focus:border-primary-400"
              required
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="mb-1.5 sm:mb-2 block text-md-sb sm:text-lg-sb text-black-500">
              카테고리
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {/* 대카테고리 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex h-12 sm:h-14 w-full items-center justify-between rounded-lg sm:rounded-xl border-2 border-primary-300 bg-white px-3 sm:px-5 text-md-r sm:text-lg-r text-primary-400"
                >
                  {formData.category}
                  <Image
                    src="/orangedown.png"
                    alt="dropdown"
                    width={20}
                    height={10}
                    className={`h-2.5 w-5 sm:h-3 sm:w-6 transition-transform ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg sm:rounded-xl border-2 border-line-gray bg-white shadow-lg">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: cat });
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-3 sm:px-6 py-2 sm:py-3 text-left text-md-r sm:text-lg-r hover:bg-primary-100"
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
                  className="flex h-12 sm:h-14 w-full items-center justify-between rounded-lg sm:rounded-xl border-2 border-primary-300 bg-white px-3 sm:px-5 text-md-r sm:text-lg-r text-primary-400"
                >
                  {formData.subCategory}
                  <Image
                    src="/orangedown.png"
                    alt="dropdown"
                    width={20}
                    height={10}
                    className={`h-2.5 w-5 sm:h-3 sm:w-6 transition-transform ${
                      showSubCategoryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSubCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg sm:rounded-xl border-2 border-line-gray bg-white shadow-lg">
                    {subCategories.map((subCat) => (
                      <button
                        key={subCat}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, subCategory: subCat });
                          setShowSubCategoryDropdown(false);
                        }}
                        className="w-full px-3 sm:px-6 py-2 sm:py-3 text-left text-md-r sm:text-lg-r hover:bg-primary-100"
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
            <label className="mb-1.5 sm:mb-2 block text-md-sb sm:text-lg-sb text-black-500">
              가격
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="1,900"
              className="h-12 sm:h-14 w-full rounded-lg sm:rounded-xl border-2 border-primary-300 bg-white px-4 sm:px-5 text-md-r sm:text-lg-r outline-none placeholder:text-gray-400 focus:border-primary-400"
              required
            />
          </div>

          {/* 상품 이미지 */}
          <div>
            <label className="mb-1.5 sm:mb-2 block text-md-sb sm:text-lg-sb text-black-500">
              상품 이미지
            </label>
            <div className="flex items-start gap-2 sm:gap-3">
              {imagePreview ? (
                <div className="relative h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-lg sm:rounded-xl bg-gray-200">
                  <Image
                    src={imagePreview}
                    alt="상품 이미지"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-lg sm:rounded-xl bg-gray-200">
                  <span className="text-xs sm:text-sm text-gray-400">이미지 없음</span>
                </div>
              )}

              <label className="flex h-32 w-32 sm:h-40 sm:w-40 cursor-pointer items-center justify-center rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 bg-white transition-colors hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="text-center">
                  <div className="mb-1 text-2xl sm:text-3xl text-gray-400">+</div>
                  <div className="text-xs sm:text-sm text-gray-400">업로드</div>
                </div>
              </label>
            </div>
          </div>

          {/* 제품링크 */}
          <div>
            <label className="mb-1.5 sm:mb-2 block text-md-sb sm:text-lg-sb text-black-500">
              제품링크
            </label>
            <input
              type="url"
              value={formData.productLink}
              onChange={(e) =>
                setFormData({ ...formData, productLink: e.target.value })
              }
              placeholder="www.codeit"
              className="h-12 sm:h-14 w-full rounded-lg sm:rounded-xl border-2 border-primary-300 bg-white px-4 sm:px-5 text-md-r sm:text-lg-r outline-none placeholder:text-gray-400 focus:border-primary-400"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 sm:h-14 flex-1 rounded-lg sm:rounded-xl border-2 border-primary-300 bg-white text-md-sb sm:text-lg-sb text-primary-400 transition-colors hover:bg-primary-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="h-12 sm:h-14 flex-1 rounded-lg sm:rounded-xl bg-primary-400 text-md-sb sm:text-lg-sb text-white transition-colors hover:bg-primary-300"
            >
              등록하기
            </button>
          </div>
        </form>
    </Modal>
  );
}
