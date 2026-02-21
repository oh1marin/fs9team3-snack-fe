"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/lib/service/userService";
import { toast } from "react-toastify";
import PasswordEyeBtn from "@/app/ui/PasswordEyeBtn";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [userData, setUserData] = useState({
    company: "코드잇",
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    password: "",
    passwordConfirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const [initialCompany, setInitialCompany] = useState("");

  useEffect(() => {
    if (user) {
      const company = user.company_name ?? "코드잇";
      setUserData({
        company,
        name: user.nickname ?? user.name ?? "",
        email: user.email ?? "",
      });
      setInitialCompany(company);
    }
  }, [user]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 10);
    setUserData((prev) => ({ ...prev, company: value }));
  };

  const handleCompanySave = () => {
    setInitialCompany(userData.company);
    toast.success("기업명이 저장되었습니다.");
  };

  const isSuperAdmin = user?.is_super_admin === "Y";
  const isCompanyChanged =
    isSuperAdmin &&
    userData.company.trim().length > 0 &&
    userData.company.trim() !== initialCompany.trim();
  const roleLabel = isSuperAdmin
    ? "최고 관리자"
    : user?.is_admin === "Y"
      ? "관리자"
      : "일반";

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "password" | "passwordConfirm"
  ) => {
    const value = e.target.value;
    if (field === "password") {
      setPasswords((prev) => ({ ...prev, password: value }));
      if (value && value.length < 8) {
        setPasswordError("비밀번호는 최소 8자 이상이어야 합니다.");
      } else {
        setPasswordError("");
      }
      // 비밀번호 변경 시 확인 필드도 다시 검증
      if (passwords.passwordConfirm && value !== passwords.passwordConfirm) {
        setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
      } else if (passwords.passwordConfirm) {
        setPasswordConfirmError("");
      }
    } else {
      setPasswords((prev) => ({ ...prev, passwordConfirm: value }));
      if (value && value !== passwords.password) {
        setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
      } else {
        setPasswordConfirmError("");
      }
    }
  };

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] items-center justify-center bg-background-peach px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[560px]">
          <div className="mb-8 sm:mb-12 h-9 w-40 animate-pulse rounded bg-gray-200 mx-auto" />
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="mb-2 sm:mb-3 h-6 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-14 sm:h-16 w-full animate-pulse rounded-xl sm:rounded-2xl bg-gray-200" />
              </div>
            ))}
            <div className="mt-6 sm:mt-8 h-14 sm:h-16 w-full animate-pulse rounded-xl sm:rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] items-center justify-center bg-background-peach px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center">
          <p className="text-xl-r text-gray-400">로그인이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCompanyChanged) {
      handleCompanySave();
    }

    if (isFormValid) {
      if (passwords.password !== passwords.passwordConfirm) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }
      if (passwords.password.length < 8) {
        toast.error("비밀번호는 최소 8자 이상이어야 합니다.");
        return;
      }
      try {
        const message = await userService.changePassword(passwords.password);
        toast.success(message);
        setPasswords({ password: "", passwordConfirm: "" });
        setPasswordError("");
        setPasswordConfirmError("");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "비밀번호 변경 중 오류가 발생했습니다."
        );
      }
    }
  };

  const isFormValid =
    passwords.password.length > 0 &&
    passwords.passwordConfirm.length > 0 &&
    passwords.password.length >= 8 &&
    passwords.password === passwords.passwordConfirm &&
    !passwordError &&
    !passwordConfirmError;

  const hasAnyChange = isCompanyChanged || isFormValid;

  const getSubmitButtonText = () => {
    if (isCompanyChanged && isFormValid) return "기업명, 비밀번호 변경하기";
    if (isCompanyChanged) return "기업명 변경하기";
    if (isFormValid) return "비밀번호 변경하기";
    return "변경하기";
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] items-center justify-center bg-background-peach px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[560px]">
        <h1 className="mb-8 sm:mb-12 text-center text-2xl-b sm:text-3xl-b text-black-500">
          내 프로필
        </h1>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">
              기업명
            </label>
            <input
              type="text"
              value={userData.company}
              onChange={handleCompanyChange}
              placeholder="기업명을 입력해주세요."
              maxLength={10}
              disabled={!isSuperAdmin}
              className={`h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-6 text-lg-r sm:text-xl-r outline-none placeholder:text-gray-400 ${
                isSuperAdmin
                  ? "border-primary-300 bg-white text-black-500 focus:border-primary-400"
                  : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
              }`}
            />
          </div>

          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">
              권한
            </label>
            <input
              type="text"
              value={roleLabel}
              readOnly
              className="h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-100 px-4 sm:px-6 text-lg-r sm:text-xl-r text-gray-600"
            />
          </div>

          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">이름</label>
            <input
              type="text"
              value={userData.name}
              disabled
              className="h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-100 px-4 sm:px-6 text-lg-r sm:text-xl-r text-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">
              이메일
            </label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-100 px-4 sm:px-6 text-lg-r sm:text-xl-r text-gray-400"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.password}
                onChange={(e) => handlePasswordInputChange(e, "password")}
                placeholder="비밀번호를 입력해주세요."
                className={`h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 bg-white px-4 sm:px-6 pr-12 sm:pr-14 text-lg-r sm:text-xl-r outline-none placeholder:text-gray-400 focus:border-primary-400 ${
                  passwordError
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-300"
                }`}
              />
              <PasswordEyeBtn
                visible={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {passwordError && (
              <span className="mt-2 block text-sm text-red-500">
                {passwordError}
              </span>
            )}
          </div>

          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                value={passwords.passwordConfirm}
                onChange={(e) =>
                  handlePasswordInputChange(e, "passwordConfirm")
                }
                placeholder="비밀번호를 다시 한 번 입력해주세요."
                className={`h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 bg-white px-4 sm:px-6 pr-12 sm:pr-14 text-lg-r sm:text-xl-r outline-none placeholder:text-gray-400 focus:border-primary-400 ${
                  passwordConfirmError
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-300"
                }`}
              />
              <PasswordEyeBtn
                visible={showPasswordConfirm}
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            {passwordConfirmError && (
              <span className="mt-2 block text-sm text-red-500">
                {passwordConfirmError}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!hasAnyChange}
            className={`mt-6 sm:mt-8 h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl text-lg-sb sm:text-xl-sb transition-colors ${
              hasAnyChange
                ? "bg-primary-400 text-white hover:bg-primary-300"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {getSubmitButtonText()}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}
