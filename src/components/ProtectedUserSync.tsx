"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

/** 마운트 시 유저 정보 재조회 */
export default function ProtectedUserSync() {
  const { refreshUser } = useAuth();
  const didSyncRef = useRef(false);

  useEffect(() => {
    if (didSyncRef.current) return;
    didSyncRef.current = true;
    refreshUser();
  }, [refreshUser]);

  return null;
}
