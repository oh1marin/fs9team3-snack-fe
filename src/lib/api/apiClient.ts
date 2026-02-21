import {
  getClientAccessToken,
  setClientAccessToken,
  setClientRefreshToken,
} from "./authToken";
import { handleTokenExpired } from "./handleTokenExpired";
import { refreshAuthAPI } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

let refreshPromise: Promise<boolean> | null = null;

/** refresh 시도, 성공 시 true, 실패 시 false */
async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const { accessToken, refreshToken } = await refreshAuthAPI();
      setClientAccessToken(accessToken);
      setClientRefreshToken(refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
  const token = getClientAccessToken();
  const defaultOptions: RequestInit = {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

  if (response.status === 401) {
    if (typeof window === "undefined") {
      const error = new Error("인증이 만료되었습니다.");
      (error as any).status = 401;
      throw error;
    }
    if (
      window.location.pathname.startsWith("/login") ||
      window.location.pathname.startsWith("/signup")
    ) {
      const error = new Error("인증이 만료되었습니다.");
      (error as any).status = 401;
      throw error;
    }

    if (!isRetry) {
      const { getClientRefreshToken } = await import("./authToken");
      if (getClientRefreshToken()) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          return apiClient(endpoint, options, true);
        }
      }
    }

    handleTokenExpired();
    const error = new Error("인증이 만료되었습니다.");
    (error as any).status = 401;
    throw error;
  }

  return response;
}

export async function fetchJSON<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiClient(endpoint, options);
  
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || `API 오류 (${response.status})`);
  }
  
  return response.json();
}
