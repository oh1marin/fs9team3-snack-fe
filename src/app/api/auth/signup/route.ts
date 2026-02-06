import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type JWTPayload = { exp?: number; iat?: number; [key: string]: unknown };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendBody = {
      email: body.email,
      password: body.password,
      passwordConfirm: body.passwordConfirmation ?? body.passwordConfirm,
      name: body.nickname ?? body.name,
    };

    const backendRes = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendBody),
    });

    const data = await backendRes.json().catch(() => ({}));

    const res = NextResponse.json(data, { status: backendRes.status });

    const setCookieHeaders = backendRes.headers.getSetCookie?.() ?? [];
    if (setCookieHeaders.length > 0) {
      for (const cookie of setCookieHeaders) {
        res.headers.append("Set-Cookie", cookie);
      }
    } else if (data.accessToken && data.refreshToken) {
      const access = jwtDecode<JWTPayload>(data.accessToken);
      const refresh = jwtDecode<JWTPayload>(data.refreshToken);
      const accessMax = Math.max(0, (access.exp ?? 0) - Math.floor(Date.now() / 1000));
      const refreshMax = Math.max(0, (refresh.exp ?? 0) - Math.floor(Date.now() / 1000));
      res.cookies.set("accessToken", data.accessToken, {
        path: "/",
        maxAge: accessMax,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      });
      res.cookies.set("refreshToken", data.refreshToken, {
        path: "/",
        maxAge: refreshMax,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      });
    }

    return res;
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "회원가입 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}
