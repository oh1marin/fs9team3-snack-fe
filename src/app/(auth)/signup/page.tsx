"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { EyeIcon, EyeOffIcon } from "@/components/icons/EyeIcons";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token") ?? undefined;
  const isInvitation = Boolean(invitationToken);

  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "코드잇",
    email: "",
    password: "",
    passwordConfirm: "",
    companyName: "코드잇",
    businessNumber: "1234",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      if (value && !validateEmail(value)) {
        setEmailError("올바른 이메일 형식이 아닙니다.");
      } else {
        setEmailError("");
      }
    }

    if (name === "password") {
      if (value && value.length < 8) {
        setPasswordError("비밀번호는 최소 8자 이상이어야 합니다.");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (isInvitation && !invitationToken) {
      toast.error(
        "초대 링크가 올바르지 않습니다. 이메일의 링크를 확인해 주세요.",
      );
      return;
    }

    setIsLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.passwordConfirm,
        invitationToken,
        formData.companyName || undefined,
        formData.businessNumber || undefined,
      );
      toast.success("회원가입이 완료되었습니다!");
      router.push("/items");
    } catch (error) {
      toast.error(
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
    formData.passwordConfirm.trim() !== "" &&
    !emailError &&
    !passwordError &&
    (!isInvitation || (isInvitation && formData.name.trim() !== ""));

  if (isInvitation) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] flex-col items-center justify-center bg-background-peach px-6 py-12">
        <div className="w-full max-w-[560px]">
          <h1 className="text-left text-2xl-b text-black-500">
            기업 담당자 회원가입
          </h1>
          <p className="mt-2 text-md-r text-gray-500">
            * 그룹 내 유저는 기업 담당자의 초대 메일을 통해 가입이 가능합니다.
          </p>

          <form onSubmit={handleSubmit} className="mt-16 w-full">
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-3">
                <span className="text-lg-m text-black-400">
                  이름(기업 담당자)
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="이름을 입력해주세요."
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-white px-5 text-lg-r outline-none placeholder:text-gray-400"
                  required
                />
              </label>

              <label className="flex flex-col gap-3">
                <span className="text-lg-m text-black-400">이메일</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력해주세요."
                  className={`h-[56px] w-full rounded-xl border bg-white px-5 text-lg-r outline-none placeholder:text-gray-400 ${
                    emailError ? "border-red-500" : "border-primary-300"
                  }`}
                  required
                />
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
                    className={`h-[56px] w-full rounded-xl border bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400 ${
                      passwordError ? "border-red-500" : "border-primary-300"
                    }`}
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
                {passwordError && (
                  <span className="text-sm text-red-500">{passwordError}</span>
                )}
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
                    className="h-[56px] w-full rounded-xl border border-primary-300 bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswordConfirm ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-3">
                <span className="text-lg-m text-black-400">회사명</span>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="회사명을 입력해주세요."
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-white px-5 text-lg-r outline-none placeholder:text-gray-400"
                />
              </label>

              <label className="flex flex-col gap-3">
                <span className="text-lg-m text-black-400">사업자 번호</span>
                <input
                  type="text"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  placeholder="사업자 번호를 입력해주세요."
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-white px-5 text-lg-r outline-none placeholder:text-gray-400"
                />
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

  // 기존 일반 회원가입 폼 (token 없을 때)
  return (
    <div className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1920px] flex-col items-center justify-center bg-background-peach px-6 py-12">
      <div className="w-full max-w-[560px]">
        <h1 className="text-left text-2xl-b text-black-500">
          안녕하세요, 스낵에 오신 걸 환영합니다
        </h1>

        <form onSubmit={handleSubmit} className="mt-16 w-full">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-3">
              <span className="text-lg-m text-black-400">이메일</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="이메일을 입력해주세요."
                className={`h-[56px] w-full rounded-xl border bg-white px-5 text-lg-r outline-none placeholder:text-gray-400 ${
                  emailError ? "border-red-500" : "border-primary-300"
                }`}
                required
              />
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
                  className={`h-[56px] w-full rounded-xl border bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400 ${
                    passwordError ? "border-red-500" : "border-primary-300"
                  }`}
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
              {passwordError && (
                <span className="text-sm text-red-500">{passwordError}</span>
              )}
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
                  className="h-[56px] w-full rounded-xl border border-primary-300 bg-white px-5 pr-12 text-lg-r outline-none placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPasswordConfirm ? <EyeIcon /> : <EyeOffIcon />}
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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center bg-background-peach">
          <span className="text-black-400">로딩 중...</span>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
