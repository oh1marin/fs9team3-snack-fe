"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { authService } from "../service/authService";

interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

// 서버 사이드 전용 함수
export async function getServerSideToken(type = "accessToken") {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(type);
  return tokenCookie ? tokenCookie.value : null;
}

export async function setServerSideTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  // 토큰 디코딩 및 만료 시간 계산
  const accessTokenData = jwtDecode<JWTPayload>(accessToken);
  const refreshTokenData = jwtDecode<JWTPayload>(refreshToken);

  const accessTokenExpiresIn =
    (accessTokenData.exp || 0) - Math.floor(Date.now() / 1000);
  const refreshTokenExpiresIn =
    (refreshTokenData.exp || 0) - Math.floor(Date.now() / 1000);

  // 쿠키 설정
  cookieStore.set("accessToken", accessToken, {
    path: "/",
    maxAge: accessTokenExpiresIn,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  cookieStore.set("refreshToken", refreshToken, {
    path: "/",
    maxAge: refreshTokenExpiresIn,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
}

export async function updateAccessToken(accessToken: string) {
  const cookieStore = await cookies();

  // 토큰 디코딩 및 만료 시간 계산
  const accessTokenData = jwtDecode<JWTPayload>(accessToken);

  const accessTokenExpiresIn =
    (accessTokenData.exp || 0) - Math.floor(Date.now() / 1000);

  // 액세스 토큰만 갱신
  cookieStore.set("accessToken", accessToken, {
    path: "/",
    maxAge: accessTokenExpiresIn,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
}

export async function clearServerSideTokens() {
  const cookieStore = await cookies();

  // 액세스 토큰 삭제
  cookieStore.delete("accessToken");

  // 리프레시 토큰 삭제
  cookieStore.delete("refreshToken");

  return { success: true };
}

export async function loginAction(email: string, password: string) {
  const { user, accessToken, refreshToken, message } = await authService.login(
    email,
    password,
  );

  if (!accessToken || !refreshToken) {
    return { success: false, error: "토큰 저장 실패" };
  }

  await setServerSideTokens(accessToken, refreshToken);
  return { success: true, userData: user, message, accessToken };
}

export async function logoutAction() {
  await clearServerSideTokens();
  return { success: true };
}

export async function registerAction(
  nickname: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  const { user, accessToken, refreshToken, message } = await authService.register(
    nickname,
    email,
    password,
    passwordConfirmation,
  );
  // 토큰 저장 로직 추가
  if (!accessToken || !refreshToken) {
    return { success: false, error: "토큰 저장 실패" };
  }

  await setServerSideTokens(accessToken, refreshToken);
  return { success: true, userData: user, message, accessToken };
}

/**
 * 인증 상태를 확인합니다 (토큰 검사만, 갱신은 하지 않음)
 * @returns {Promise<boolean>} 인증 성공 여부
 */
export async function checkAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // accessToken이 있으면 인증됨
  return !!accessToken;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * 서버에서 쿠키로 /api/auth/me 호출해 user 반환 (protected 레이아웃용)
 */
export async function getServerUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: `accessToken=${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? data?.data ?? (data?.id ? data : null) ?? null;
  } catch {
    return null;
  }
}

/**
 * 인증 상태를 확인합니다 (accessToken 또는 refreshToken 중 하나라도 있으면 통과)
 * @returns {Promise<boolean>} 인증 성공 여부
 */
export async function checkAuthWithRefresh() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // accessToken 또는 refreshToken 중 하나라도 있으면 인증됨
  return !!(accessToken || refreshToken);
}

/**
 * @deprecated 더 이상 사용하지 않습니다. checkAuth() 또는 checkAuthWithRefresh()를 사용하세요.
 * 인증 상태를 확인하고 필요시 토큰을 갱신합니다
 * @returns {Promise<boolean>} 인증 성공 여부
 */
export async function checkAndRefreshAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // 1. accessToken이 있으면 인증됨
  if (accessToken) {
    return true;
  }

  // 2. accessToken 없고 refreshToken도 없으면 인증 실패
  if (!refreshToken) {
    return false;
  }

  // 3. refreshToken으로 갱신 시도
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (response.ok) {
      const { accessToken: newAccessToken } = await response.json();

      // 새 토큰 저장
      await updateAccessToken(newAccessToken);

      return true; // 갱신 성공
    }

    return false; // 갱신 실패
  } catch (error) {
    console.error("토큰 갱신 중 오류:", error);
    return false;
  }
}
