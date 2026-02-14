"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function LayoutWithHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthRoute =
    pathname === "/login" || pathname === "/signup";

  if (isAuthRoute) {
    return <>{children}</>;
  }

  const hasToken = pathname !== "/";

  return (
    <>
      <Header hasToken={hasToken} />
      {children}
    </>
  );
}
