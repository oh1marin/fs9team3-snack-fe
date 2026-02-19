"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Header({ hasToken = false }: { hasToken?: boolean }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLanding = pathname === "/";
  const showLoggedIn = isLanding ? !!user : hasToken || !!user;
  const showSkeleton = isLoading && (isLanding || !hasToken);

  if (showSkeleton) {
    return (
      <header className="w-full bg-primary-400">
        <div className="mx-auto flex h-[88px] w-full max-w-[1920px] items-center justify-between px-6">
          <div className="h-10 w-[180px] animate-pulse rounded bg-white/20" />
          <div className="flex items-center gap-10">
            <div className="h-6 w-16 animate-pulse rounded bg-white/20" />
            <div className="h-6 w-20 animate-pulse rounded bg-white/20" />
          </div>
        </div>
      </header>
    );
  }

  if (!showLoggedIn) {
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

  const rawAdmin = user?.is_admin ?? (user as { isAdmin?: string | boolean })?.isAdmin;
  const isAdmin =
    rawAdmin === "Y" ||
    rawAdmin === "y" ||
    rawAdmin === true ||
    String(rawAdmin ?? "").toLowerCase() === "true";

  const isSuperAdmin = user?.is_super_admin === "Y";

  // 로그인 시 헤더 (관리자면 링크 더 표시)
  return (
    <header className="border-b border-line-gray bg-background-peach">
      <div className="relative mx-auto flex h-[88px] max-w-[1920px] items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 flex-shrink-0 items-center gap-10">
          {/* 태블릿 이하: 로고 왼쪽에 3line 메뉴 버튼 */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex p-1 md:hidden"
            aria-label="메뉴 열기"
          >
            <Image
              src="/3line.png"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
            />
          </button>
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/smallSnacklogo.png"
              alt="Snack"
              width={126}
              height={32}
              priority
              className="h-6 w-auto sm:h-8"
            />
          </Link>
          <nav className="hidden flex-wrap items-center gap-6 text-left md:flex sm:gap-10">
            <Link
              href="/items"
              className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/items" || pathname.startsWith("/items/") ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
            >
              상품 리스트
            </Link>
            <Link
              href="/orders"
              className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/orders" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
            >
              구매 요청 내역
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/orders"
                  className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/admin/orders" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
                >
                  구매 요청 관리
                </Link>
                <Link
                  href="/admin/purchase-history"
                  className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname.startsWith("/admin/purchase-history") ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
                >
                  구매 내역 확인
                </Link>
                <Link
                  href="/admin/items"
                  className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/admin/items" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
                >
                  상품 등록 내역
                </Link>
              </>
            )}
            {!isAdmin && (
              <Link
                href="/admin/items"
                className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/admin/items" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
              >
                상품 등록 내역
              </Link>
            )}
            {isSuperAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/admin" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
              >
                관리
              </Link>
            )}
          </nav>
        </div>

        <div className="flex flex-shrink-0 items-center gap-10">
          {/* 태블릿 이하: 장바구니(bag2.png) + 프로필(man.png) */}
          <Link
            href="/cart"
            className={`flex items-center gap-1.5 text-base font-medium transition-colors md:hidden ${pathname === "/cart" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
            aria-label={`장바구니 ${cartCount}개`}
          >
            <span className="relative inline-block">
              <Image
                src="/bag2.png"
                alt="장바구니"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span
                className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-400 px-1.5 text-xs font-medium text-white"
                aria-hidden
              >
                {cartCount}
              </span>
            </span>
          </Link>
          <Link
            href="/profile"
            className={`flex items-center md:hidden ${pathname === "/profile" ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
            aria-label="프로필"
          >
            <Image
              src="/man.png"
              alt="프로필"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </Link>
          {/* md 이상: Cart 텍스트 + 뱃지, Profile, Logout */}
          <Link
            href="/cart"
            className={`hidden items-center gap-1.5 text-base font-medium transition-colors md:flex ${pathname === "/cart" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
          >
            Cart
            <span
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-400 px-1.5 text-xs font-medium text-white"
              aria-label={`장바구니 ${cartCount}개`}
            >
              {cartCount}
            </span>
          </Link>
          <Link
            href="/profile"
            className="hidden text-base font-medium text-gray-400 transition-colors hover:text-primary-400 md:inline-block"
          >
            Profile
          </Link>
          <button
            onClick={async () => {
              try {
                const message = await logout();
                toast.success(message || "로그아웃 되었습니다.");
                router.push("/");
              } catch (error) {
                toast.error("로그아웃 중 오류가 발생했습니다.");
              }
            }}
            className="hidden text-base font-medium text-gray-400 transition-colors hover:text-primary-400 md:inline-block"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 태블릿 이하: 3line 메뉴 드로어 */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="fixed left-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col gap-1 border-r border-line-gray bg-background-peach p-4 pt-6 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="메뉴"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-lg font-semibold text-black-400">메뉴</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-black-400"
                aria-label="메뉴 닫기"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">
              <Link
                href="/items"
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-base font-medium ${pathname === "/items" || pathname.startsWith("/items/") ? "bg-primary-100 text-primary-400" : "text-gray-600 hover:bg-gray-100"}`}
              >
                상품 리스트
              </Link>
              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-base font-medium ${pathname === "/orders" ? "bg-primary-100 text-primary-400" : "text-gray-600 hover:bg-gray-100"}`}
              >
                구매 요청 내역
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/orders"
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-base font-medium ${pathname === "/admin/orders" ? "bg-primary-100 text-primary-400" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    구매 요청 관리
                  </Link>
                  <Link
                    href="/admin/purchase-history"
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-base font-medium ${pathname.startsWith("/admin/purchase-history") ? "bg-primary-100 text-primary-400" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    구매 내역 확인
                  </Link>
                  <Link
                    href="/admin/items"
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-base font-medium ${pathname === "/admin/items" ? "bg-primary-100 text-primary-400" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    상품 등록 내역
                  </Link>
                </>
              )}
              {!isAdmin && (
                <Link
                  href="/admin/items"
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-medium ${pathname === "/admin/items" ? "bg-primary-100 text-primary-400" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  상품 등록 내역
                </Link>
              )}
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-medium ${pathname === "/admin" ? "bg-primary-100 text-primary-400" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  관리
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
