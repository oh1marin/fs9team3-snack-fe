"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 8) {
      alert("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      await register(
        "",  // nickname (필요시 추가)
        formData.email,
        formData.password,
        formData.passwordConfirm
      );
      alert("회원가입이 완료되었습니다!");
      router.push("/");
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.passwordConfirm.trim() !== "";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] flex-col items-center justify-center bg-bg-400 px-6 py-12">
      <div className="w-full max-w-[560px]">
        <h1 className="text-left text-2xl-b text-black-500">
          안녕하세요, 스넥에 오신 걸 환영합니다
        </h1>

        <form onSubmit={handleSubmit} className="mt-16 w-full">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-3">
              <span className="text-lg-m text-black-400">이메일</span>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력해주세요."
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Image
                    src="/closeeye.png"
                    alt="아이콘"
                    width={24}
                    height={24}
                    className="opacity-40"
                  />
                </div>
              </div>
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-lg-m text-black-400">비밀번호</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력해주세요."
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <Image
                    src="/closeeye.png"
                    alt="비밀번호 표시/숨김"
                    width={24}
                    height={24}
                    className="opacity-40"
                  />
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-3">
              <span className="text-lg-m text-black-400">비밀번호 확인</span>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 한 번 입력해주세요."
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <Image
                    src="/closeeye.png"
                    alt="비밀번호 표시/숨김"
                    width={24}
                    height={24}
                    className="opacity-40"
                  />
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`mt-10 h-[56px] w-full rounded-xl text-lg-sb transition-colors disabled:opacity-50 ${
              isFormValid
                ? "bg-primary-400 text-white hover:bg-primary-300"
                : "bg-gray-300 text-gray-400"
            }`}
          >
            {isLoading ? "가입 중..." : "시작하기"}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-md-r text-gray-500">
            <span>이미 계정이 있으신가요?</span>
            <Link
              href="/login"
              className="text-md-sb text-primary-400 underline underline-offset-2 hover:text-primary-300"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
