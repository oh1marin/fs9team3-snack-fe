"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/** 로그인/회원가입은 API 라우트로 쿠키 받음. 가드는 checkAuth로 처리 */

// 서버 사이드 전용 함수
export async function getServerSideToken(type = "accessToken") {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(type);
  return tokenCookie ? tokenCookie.value : null;
}

/** @deprecated refresh 등에서만 사용 */
export async function setServerSideTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const accessTokenData = jwtDecode<JWTPayload>(accessToken);
  const refreshTokenData = jwtDecode<JWTPayload>(refreshToken);
  const accessTokenExpiresIn =
    (accessTokenData.exp || 0) - Math.floor(Date.now() / 1000);
  const refreshTokenExpiresIn =
    (refreshTokenData.exp || 0) - Math.floor(Date.now() / 1000);
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

  const accessTokenData = jwtDecode<JWTPayload>(accessToken);
  const accessTokenExpiresIn =
    (accessTokenData.exp || 0) - Math.floor(Date.now() / 1000);
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
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  return { success: true };
}

/** @deprecated 클라이언트는 API 라우트 사용 */
export async function loginAction(email: string, password: string) {
  try {
    const { user, accessToken, refreshToken, message } = await (
      await import("../service/authService")
    ).authService.login(email, password);
    if (!accessToken || !refreshToken) {
      return { success: false, message: "토큰 저장에 실패했습니다." };
    }
    await setServerSideTokens(accessToken, refreshToken);
    return { success: true, userData: user, message, accessToken };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "로그인에 실패했습니다. 다시 시도해 주세요.";
    return { success: false, message };
  }
}

export async function logoutAction() {
  await clearServerSideTokens();
  return { success: true };
}

/** @deprecated 클라이언트는 API 라우트 사용 */
export async function registerAction(
  nickname: string,
  email: string,
  password: string,
  passwordConfirmation: string,
) {
  try {
    const { user, accessToken, refreshToken, message } = await (
      await import("../service/authService")
    ).authService.register(
      nickname,
      email,
      password,
      passwordConfirmation,
    );
    if (!accessToken || !refreshToken) {
      return { success: false, message: "토큰 저장에 실패했습니다." };
    }
    await setServerSideTokens(accessToken, refreshToken);
    return { success: true, userData: user, message, accessToken };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : "회원가입에 실패했습니다. 다시 시도해 주세요.";
    return { success: false, message };
  }
}

/** 인증 여부 확인 (토큰만 검사) */
export async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    return !!accessToken;
  } catch {
    return false;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** 서버에서 /api/auth/me로 user 조회, 에러 시 null */
export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) return null;
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

/** accessToken 또는 refreshToken 있으면 통과 */
export async function checkAuthWithRefresh() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  return !!(accessToken || refreshToken);
}

/** @deprecated checkAuth 또는 checkAuthWithRefresh 사용 */
export async function checkAndRefreshAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (accessToken) return true;
  if (!refreshToken) return false;
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${baseURL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (response.ok) {
      const { accessToken: newAccessToken } = await response.json();

      await updateAccessToken(newAccessToken);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
