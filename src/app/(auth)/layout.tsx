import Link from "next/link";
import Image from "next/image";
import { checkAuth } from "@/lib/actions/auth";
import { redirect, RedirectType } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 체크 (accessToken 검사만)
  const isAuthenticated = await checkAuth();

  // 이미 인증된 사용자는 items로 리다이렉트
  if (isAuthenticated) {
    redirect("/items", RedirectType.replace);
  }

  return (
    <>
      {/* 회원가입/로그인 페이지 전용 헤더 */}
      <header className="w-full bg-primary-400">
        <div className="mx-auto flex h-[88px] w-full max-w-[1920px] items-center justify-center px-6">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/whitesnacklogo.png"
              alt="Snack"
              width={180}
              height={48}
              priority
              className="h-10 w-auto sm:h-12"
            />
          </Link>
        </div>
      </header>
      {children}
    </>
  );
}
