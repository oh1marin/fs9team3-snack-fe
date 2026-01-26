"use client";

import {
  loginAction,
  registerAction,
} from "@/lib/actions/auth";
import { authService } from "@/lib/service/authService";
import { userService } from "@/lib/service/userService";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  nickname?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
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

  const getUser = async () => {
    try {
      const response = await userService.getMe();
      // 백엔드 응답: { success: true, user: {...} }
      setUser(response.user || null);
    } catch (error) {
      console.error("사용자 정보를 가져오는데 실패했습니다:", error);
      setUser(null);
    }
  };

  const register = async (
    nickname: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    // 회원가입 성공 시 유저데이터를 API 에서 응답해주는 경우, 즉시 로그인 처리 가능
    const { userData, success, message } = await registerAction(
      nickname,
      email,
      password,
      passwordConfirmation,
    );

    if (!success) {
      throw new Error("회원가입 실패");
    }
    setUser(userData);
    return message;
  };

  const login = async (email: string, password: string) => {
    // 로그인 성공 시 유저데이터를 API 에서 응답해주는 경우, 유저 상태 변경
    const { userData, success, message } = await loginAction(email, password);

    if (!success) {
      throw new Error("로그인 실패");
    }
    setUser(userData);
    return message;
  };

  const logout = async () => {
    try {
      const message = await authService.logout();
      setUser(null);
      return message;
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  };

  useEffect(() => {
    // 웹페이지 랜딩 또는 새로고침 시 마다 서버에서 유저 데이터 동기화
    // 쿠키가 있으면 자동으로 전송되므로 바로 시도
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
