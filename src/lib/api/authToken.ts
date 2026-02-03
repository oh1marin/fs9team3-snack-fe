const STORAGE_KEY = "snack_access_token";

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
