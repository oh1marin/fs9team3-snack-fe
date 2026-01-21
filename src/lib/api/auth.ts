const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// 회원가입 API 호출
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
    credentials: "include", // ✅ 쿠키 전송 허용
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "회원가입에 실패했습니다.");
  }

  return response.json();
};

// 로그인 API 호출
export const loginAPI = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅ 쿠키 전송 허용
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "로그인에 실패했습니다.");
  }

  return response.json();
};

// 현재 사용자 정보 조회 (쿠키 기반)
export const getCurrentUserAPI = async () => {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    credentials: "include", // ✅ 쿠키가 자동으로 전송됨
  });

  if (!response.ok) {
    throw new Error("사용자 정보를 가져올 수 없습니다.");
  }

  return response.json();
};
