const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** refreshToken으로 새 accessToken, refreshToken 발급 (토큰 회전) */
export async function refreshAuthAPI(): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const { getClientRefreshToken } = await import("./authToken");
  const refreshToken = getClientRefreshToken();
  const body: { refreshToken?: string } = {};
  if (refreshToken) body.refreshToken = refreshToken;

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "토큰 갱신에 실패했습니다.");
    (error as any).status = response.status;
    throw error;
  }

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
}

export const signupAPI = async (data: {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
  company_name?: string;
}) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "회원가입에 실패했습니다.");
  }

  return result;
};

export const loginAPI = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "로그인에 실패했습니다.");
  }

  return result;
};

export const getCurrentUserAPI = async (
  isRetry = false
): Promise<Record<string, unknown>> => {
  const { getClientAccessToken, setClientAccessToken, setClientRefreshToken } =
    await import("./authToken");
  const token = getClientAccessToken();
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window === "undefined") {
        const error = new Error(result.message || "인증이 만료되었습니다.");
        (error as any).status = 401;
        throw error;
      }
      if (
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/signup")
      ) {
        const error = new Error(result.message || "인증이 만료되었습니다.");
        (error as any).status = 401;
        throw error;
      }
      if (!isRetry) {
        try {
          const { accessToken, refreshToken } = await refreshAuthAPI();
          setClientAccessToken(accessToken);
          setClientRefreshToken(refreshToken);
          return getCurrentUserAPI(true);
        } catch {
          // refresh 실패 시 아래에서 처리
        }
      }
      const { handleTokenExpired } = await import("./handleTokenExpired");
      handleTokenExpired();
      const error = new Error(result.message || "인증이 만료되었습니다.");
      (error as any).status = 401;
      throw error;
    }
    throw new Error(result.message || "사용자 정보를 가져올 수 없습니다.");
  }

  return result;
};

export const changePasswordAPI = async (
  password: string,
  isRetry = false
): Promise<{ message?: string }> => {
  const { getClientAccessToken, setClientAccessToken, setClientRefreshToken } =
    await import("./authToken");
  const token = getClientAccessToken();
  const response = await fetch(`${API_URL}/api/auth/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ password }),
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined" && !isRetry) {
        try {
          const { accessToken, refreshToken } = await refreshAuthAPI();
          setClientAccessToken(accessToken);
          setClientRefreshToken(refreshToken);
          return changePasswordAPI(password, true);
        } catch {
          // refresh 실패 시 아래에서 처리
        }
      }
      const { handleTokenExpired } = await import("./handleTokenExpired");
      if (typeof window !== "undefined") handleTokenExpired();
      const error = new Error(result.message || "인증이 만료되었습니다.");
      (error as any).status = 401;
      throw error;
    }
    throw new Error(result.message || "비밀번호 변경에 실패했습니다.");
  }

  return result;
};
