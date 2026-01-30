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

  useEffect(() => {
    if (user) {
      setUserData({
        company: user.company_name || "코드잇",
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

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

  // 사용자 정보가 없을 때 (로그인 안됨)
  if (!user) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] items-center justify-center bg-background-peach px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center">
          <p className="text-xl-r text-gray-400">로그인이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // 프론트엔드에서 비밀번호 확인 검증
    if (passwords.password !== passwords.passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwords.password.length < 8) {
      toast.error("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    try {
      // 백엔드에는 password만 전송
      const message = await userService.changePassword(passwords.password);
      toast.success(message);
      setPasswords({ password: "", passwordConfirm: "" });
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "비밀번호 변경 중 오류가 발생했습니다."
      );
    }
  };

  const isFormValid =
    passwords.password.length > 0 &&
    passwords.passwordConfirm.length > 0 &&
    passwords.password === passwords.passwordConfirm;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] items-center justify-center bg-background-peach px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[560px]">
        <h1 className="mb-8 sm:mb-12 text-center text-2xl-b sm:text-3xl-b text-black-500">
          내 프로필
        </h1>

        <form onSubmit={handlePasswordChange} className="space-y-4 sm:space-y-6">
          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">
              기업명
            </label>
            <input
              type="text"
              value={userData.company}
              disabled
              className="h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-gray-100 px-4 sm:px-6 text-lg-r sm:text-xl-r text-gray-400"
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

          <div>
            <label className="mb-2 sm:mb-3 block text-lg-m sm:text-xl-m text-black-500">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.password}
                onChange={(e) =>
                  setPasswords({ ...passwords, password: e.target.value })
                }
                placeholder="비밀번호를 입력해주세요."
                className="h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 border-primary-300 bg-white px-4 sm:px-6 pr-12 sm:pr-14 text-lg-r sm:text-xl-r outline-none placeholder:text-gray-400 focus:border-primary-400"
              />
              <PasswordEyeBtn
                visible={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
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
                  setPasswords({
                    ...passwords,
                    passwordConfirm: e.target.value,
                  })
                }
                placeholder="비밀번호를 다시 한 번 입력해주세요."
                className="h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl border-2 border-primary-300 bg-white px-4 sm:px-6 pr-12 sm:pr-14 text-lg-r sm:text-xl-r outline-none placeholder:text-gray-400 focus:border-primary-400"
              />
              <PasswordEyeBtn
                visible={showPasswordConfirm}
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`mt-6 sm:mt-8 h-14 sm:h-16 w-full rounded-xl sm:rounded-2xl text-lg-sb sm:text-xl-sb transition-colors ${
              isFormValid
                ? "bg-primary-400 text-white hover:bg-primary-300"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            변경하기
          </button>
        </form>
      </div>
    </div>
  );
}
