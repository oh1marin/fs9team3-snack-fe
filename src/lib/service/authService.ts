import { loginAPI, signupAPI, getCurrentUserAPI } from "../api/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const authService = {
  async login(email: string, password: string) {
    const response = await loginAPI(email, password);
    return {
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
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
    };
  },

  async logout() {
    // 서버에 로그아웃 요청
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
    }
  },

  async getMe() {
    return await getCurrentUserAPI();
  },
};
