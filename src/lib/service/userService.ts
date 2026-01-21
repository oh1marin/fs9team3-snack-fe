import { getCurrentUserAPI } from "../api/auth";

export const userService = {
  async getMe() {
    // 쿠키가 자동으로 전송되므로 토큰 파라미터 불필요
    return await getCurrentUserAPI();
  },
};
