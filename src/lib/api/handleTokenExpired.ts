import { toast } from "react-toastify";
import { setClientAccessToken } from "./authToken";

/** 토큰 만료 시 토스트 표시 후 로그인 페이지로 replace (뒤로가기 시 만료 페이지로 가지 않음) */
export function handleTokenExpired(): void {
  if (typeof window === "undefined") return;
  setClientAccessToken(null);
  toast.error("로그인 시간 만료됐습니다.");
  window.location.replace("/login");
}
