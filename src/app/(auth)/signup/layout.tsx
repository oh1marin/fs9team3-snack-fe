import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description:
    "Snack 기업용 간식 마켓플레이스 회원가입. 기업 담당자로 가입해 사내 간식·음료를 관리하세요.",
  openGraph: {
    title: "회원가입 | Snack",
    description:
      "Snack 기업용 간식 마켓플레이스 회원가입. 기업 담당자로 가입해 사내 간식·음료를 관리하세요.",
    url: "https://marin-snack.store/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
