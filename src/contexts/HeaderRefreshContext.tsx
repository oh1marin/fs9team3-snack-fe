"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface HeaderRefreshContextValue {
  refreshKey: number;
  refreshHeader: () => void;
}

const HeaderRefreshContext = createContext<HeaderRefreshContextValue | null>(null);

export function HeaderRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshHeader = useCallback(() => setRefreshKey((k) => k + 1), []);
  return (
    <HeaderRefreshContext.Provider value={{ refreshKey, refreshHeader }}>
      {children}
    </HeaderRefreshContext.Provider>
  );
}

export function useHeaderRefresh() {
  const ctx = useContext(HeaderRefreshContext);
  if (!ctx) return { refreshKey: 0, refreshHeader: () => {} };
  return ctx;
}
