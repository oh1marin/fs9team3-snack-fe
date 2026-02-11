"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthInitializerProps {
  initialUser: Record<string, unknown> | null;
}

/** 서버 user를 context에 세팅 */
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
