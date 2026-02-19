import { getClientAccessToken } from "./authToken";
import { handleTokenExpired } from "./handleTokenExpired";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
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
    if (typeof window !== "undefined") {
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signup")
      ) {
        handleTokenExpired();
      }
    }
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
