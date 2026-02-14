"use client";

import { useHeaderRefresh } from "@/contexts/HeaderRefreshContext";
import Header from "./Header";

export default function HeaderWithRefresh({ hasToken = false }: { hasToken?: boolean }) {
  const { refreshKey } = useHeaderRefresh();
  return <Header key={refreshKey} hasToken={hasToken} />;
}
