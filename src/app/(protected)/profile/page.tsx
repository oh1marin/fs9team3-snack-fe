"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.password !== passwords.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    console.log("비밀번호 변경:", passwords.password);
    alert("비밀번호가 변경되었습니다.");
    setPasswords({ password: "", passwordConfirm: "" });
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="sm:w-6 sm:h-6"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="sm:w-6 sm:h-6"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
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
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPasswordConfirm ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="sm:w-6 sm:h-6"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="sm:w-6 sm:h-6"
                  >
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
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
