import { checkAuth } from "@/lib/actions/auth";
import { redirect, RedirectType } from "next/navigation";
import Header from "@/components/Header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인증 체크 (accessToken 검사만)
  const isAuthenticated = await checkAuth();

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    redirect("/login", RedirectType.replace);
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
