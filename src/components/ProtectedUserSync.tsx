"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * protected 라우트 레이아웃에서 마운트될 때 유저 정보를 한 번 다시 불러옵니다.
 * 서버는 이미 checkAuth()로 토큰 검사 통과 → getMe() 한 번 더 시도해서 user 채움.
 */
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
