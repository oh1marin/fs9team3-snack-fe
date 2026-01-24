"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  // 미 로그인 헤더
  if (!user) {
    return (
      <header className="w-full bg-primary-400">
        <div className="mx-auto flex h-[88px] w-full max-w-[1920px] items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/whitesnacklogo.png"
              alt="Snack"
              width={180}
              height={48}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav className="flex items-center gap-10">
            <Link
              href="/login"
              className="text-lg font-semibold text-white hover:opacity-90"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="text-lg font-semibold text-white hover:opacity-90"
            >
              회원가입
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  // 로그인 시 헤더
  return (
    <header className="border-b border-line-gray bg-background-peach">
      <div className="mx-auto flex h-[88px] max-w-[1920px] items-center justify-between px-6">
        <div className="flex items-center gap-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/smallSnacklogo.png"
              alt="Snack"
              width={126}
              height={32}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <Link
            href="/items"
            className="text-xl font-semibold text-primary-400 transition-colors hover:text-primary-300"
          >
            상품 리스트
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/profile"
            className="text-base font-medium text-gray-400 transition-colors hover:text-black-400"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="text-base font-medium text-gray-400 transition-colors hover:text-black-400"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
