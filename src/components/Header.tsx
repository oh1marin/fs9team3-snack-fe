"use client";

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

  // 로그인 시 헤더 (관리자면 링크 더 표시)
  return (
    <header className="border-b border-line-gray bg-background-peach">
      <div className="relative mx-auto flex h-[88px] max-w-[1920px] items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 flex-shrink-0 items-center gap-10">
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
          <nav className="flex flex-wrap items-center gap-6 text-left sm:gap-10">
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
            <Link
              href="/admin/items"
              className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/admin/items" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
            >
              상품 등록 내역
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
                  className={`text-sm font-semibold transition-colors min-[376px]:text-base ${pathname === "/admin/purchase-history" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
                >
                  구매 내역 확인
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-shrink-0 items-center gap-10">
          <Link
            href="/cart"
            className={`flex items-center gap-1.5 text-base font-medium transition-colors ${pathname === "/cart" ? "text-primary-400" : "text-gray-400 hover:text-primary-400"}`}
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
            className="text-base font-medium text-gray-400 transition-colors hover:text-primary-400"
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
            className="text-base font-medium text-gray-400 transition-colors hover:text-primary-400"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
