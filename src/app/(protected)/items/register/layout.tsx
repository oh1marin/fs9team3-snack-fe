import { Metadata } from "next";

export const metadata: Metadata = {
  title: "상품 등록 내역",
};

export default function ItemsRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
