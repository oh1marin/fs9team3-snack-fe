import { Metadata } from "next";

export const metadata: Metadata = {
  title: "장바구니",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
