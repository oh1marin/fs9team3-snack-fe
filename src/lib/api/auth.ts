const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export const getCurrentUserAPI = async () => {
  const { getClientAccessToken } = await import("./authToken");
  const token = getClientAccessToken();
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      const { handleTokenExpired } = await import("./handleTokenExpired");
      if (typeof window !== "undefined") {
        if (
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/signup")
        ) {
          handleTokenExpired();
        }
      }
      const error = new Error(result.message || "인증이 만료되었습니다.");
      (error as any).status = 401;
      throw error;
    }
    throw new Error(result.message || "사용자 정보를 가져올 수 없습니다.");
  }

  return result;
};

export const changePasswordAPI = async (password: string) => {
  const { getClientAccessToken } = await import("./authToken");
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
      const { handleTokenExpired } = await import("./handleTokenExpired");
      if (typeof window !== "undefined") {
        handleTokenExpired();
      }
      const error = new Error(result.message || "인증이 만료되었습니다.");
      (error as any).status = 401;
      throw error;
    }
    throw new Error(result.message || "비밀번호 변경에 실패했습니다.");
  }

  return result;
};
