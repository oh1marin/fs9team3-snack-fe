import { Metadata } from "next";

export const metadata: Metadata = {
  title: "구매 요청 완료",
};

export default function CartCompleteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
