import { loginAPI, signupAPI, getCurrentUserAPI } from "../api/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const authService = {
  async login(email: string, password: string) {
    const response = await loginAPI(email, password);
    return {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      message: response.message,
    };
  },

  async register(
    nickname: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) {
    const response = await signupAPI({
      email,
      password,
      passwordConfirm: passwordConfirmation,
      name: nickname,
    });
    return {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      message: response.message,
    };
  },

  async logout() {
    // 서버에 로그아웃 요청
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      return result.message || "로그아웃 되었습니다.";
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
      throw error;
    }
  },

  async getMe() {
    return await getCurrentUserAPI();
  },
};
