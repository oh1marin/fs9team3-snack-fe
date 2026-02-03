const STORAGE_KEY = "snack_access_token";

/**
 * 클라이언트용 액세스 토큰 저장소
 * cross-origin(로컬→EC2) 시 쿠키가 안 가므로 API 요청 시 Authorization 헤더로 사용
 * 새로고침 후에도 유지하려면 localStorage에 저장
 */
let clientAccessToken: string | null = null;

export function setClientAccessToken(token: string | null): void {
  clientAccessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  }
}

export function getClientAccessToken(): string | null {
  if (clientAccessToken) return clientAccessToken;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      clientAccessToken = stored;
      return stored;
    }
  }
  return null;
}
