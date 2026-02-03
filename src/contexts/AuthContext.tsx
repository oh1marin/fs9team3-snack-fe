"use client";

import {
  loginAction,
  registerAction,
  logoutAction,
} from "@/lib/actions/auth";
import { setClientAccessToken } from "@/lib/api/authToken";
import { authService } from "@/lib/service/authService";
import { userService } from "@/lib/service/userService";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  nickname?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  setInitialUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<string | undefined>;
  logout: () => Promise<string | undefined>;
  register: (
    nickname: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUser = useCallback(async (retryCount = 0) => {
    const maxRetries = 2;
    try {
      setIsLoading(true);
      const response = await userService.getMe();
      const userData =
        response?.user ?? response?.data ?? (response?.id ? response : null);
      setUser(userData || null);
      setIsLoading(false);
    } catch (error: any) {
      if (error.status === 401) {
        setUser(null);
      } else {
        setUser((prev) => prev);
        if (retryCount < maxRetries && typeof window !== "undefined") {
          setTimeout(() => getUser(retryCount + 1), 500 * (retryCount + 1));
        }
      }
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(() => getUser(0), [getUser]);

  const setInitialUser = useCallback((u: User | null) => {
    setUser(u);
    setIsLoading(false);
  }, []);

  const register = async (
    nickname: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    // 회원가입 성공 시 유저데이터를 API 에서 응답해주는 경우, 즉시 로그인 처리 가능
    const { userData, success, message, accessToken } = await registerAction(
      nickname,
      email,
      password,
      passwordConfirmation,
    );

    if (!success) {
      throw new Error(message || "회원가입 실패");
    }
    if (accessToken) setClientAccessToken(accessToken);
    setUser(userData);
    setIsLoading(false);
    return message;
  };

  const login = async (email: string, password: string) => {
    const { userData, success, message, accessToken } = await loginAction(email, password);

    if (!success) {
      throw new Error(message || "로그인 실패");
    }
    if (accessToken) setClientAccessToken(accessToken);
    setUser(userData);
    setIsLoading(false);
    return message;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // 백엔드 실패해도 로컬은 로그아웃 처리
    }
    setClientAccessToken(null);
    await logoutAction();
    setUser(null);
    return "로그아웃되었습니다.";
  };

  useEffect(() => {
    // 웹페이지 랜딩 또는 새로고침 시 마다 서버에서 유저 데이터 동기화
    // 쿠키가 있으면 자동으로 전송되므로 바로 시도
    getUser();
  }, [getUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, setInitialUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
