import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description:
    "Snack 기업용 간식 마켓플레이스 로그인. 사내 간식·음료를 관리하고 주문하세요.",
  openGraph: {
    title: "로그인 | Snack",
    description:
      "Snack 기업용 간식 마켓플레이스 로그인. 사내 간식·음료를 관리하고 주문하세요.",
    url: "https://marin-snack.store/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
