const ACCESS_TOKEN_KEY = "snack_access_token";
const REFRESH_TOKEN_KEY = "snack_refresh_token";

let clientAccessToken: string | null = null;
let clientRefreshToken: string | null = null;

export function setClientAccessToken(token: string | null): void {
  clientAccessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getClientAccessToken(): string | null {
  if (clientAccessToken) return clientAccessToken;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      clientAccessToken = stored;
      return stored;
    }
  }
  return null;
}

export function setClientRefreshToken(token: string | null): void {
  clientRefreshToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getClientRefreshToken(): string | null {
  if (clientRefreshToken) return clientRefreshToken;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (stored) {
      clientRefreshToken = stored;
      return stored;
    }
  }
  return null;
}

export function clearClientTokens(): void {
  clientAccessToken = null;
  clientRefreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
