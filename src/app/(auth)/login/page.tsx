"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { EyeIcon, EyeOffIcon } from "@/components/icons/EyeIcons";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 이메일 실시간 검증
    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("올바른 이메일 형식이 아닙니다.");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);

    try {
      const message = await login(formData.email, formData.password);
      toast.success(message || "로그인 성공!");
      router.push("/");
    } catch (error) {
      console.error("로그인 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "" && !emailError;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] flex-col items-center justify-center bg-background-peach px-6">
      <div className="w-full max-w-[560px]">
        <h1 className="text-left text-2xl-b text-black-500">로그인</h1>

        <form onSubmit={handleSubmit} className="mt-16 w-full">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-3">
              <span className="text-lg-m text-black-400">이메일</span>
              <div className="relative">
                <input
                  type={showEmail ? "text" : "email"}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력해주세요."
                  className={`h-[56px] w-full rounded-xl border bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400 ${
                    emailError ? "border-red-500" : "border-primary-300"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowEmail(!showEmail)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showEmail ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
              {emailError && (
                <span className="text-sm text-red-500">{emailError}</span>
              )}
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
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
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
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-md-r text-gray-500">
            <span>기업 담당자이신가요?</span>
            <Link
              href="/signup"
              className="text-md-sb text-primary-400 underline underline-offset-2 hover:text-primary-300"
            >
              가입하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
