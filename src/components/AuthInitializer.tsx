"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthInitializerProps {
  initialUser: Record<string, unknown> | null;
}

/**
 * protected 라우트에서 서버가 조회한 user를 context에 넣어줍니다.
 * 프로필 등에서 user가 바로 쓰이도록 합니다..
 */
export default function AuthInitializer({ initialUser }: AuthInitializerProps) {
  const { setInitialUser } = useAuth();
  const didSetRef = useRef(false);

  useEffect(() => {
    if (didSetRef.current) return;
    didSetRef.current = true;
    setInitialUser(initialUser as any);
  }, [initialUser, setInitialUser]);

  return null;
}
