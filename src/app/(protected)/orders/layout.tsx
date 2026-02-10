import { Metadata } from "next";

export const metadata: Metadata = {
  title: "구매 요청 내역",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
