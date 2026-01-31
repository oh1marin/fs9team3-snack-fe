const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * API 호출 헬퍼 함수
 * 401 에러 발생 시 자동으로 로그인 페이지로 리다이렉트
 */
export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: "include", // 쿠키 자동 전송
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, defaultOptions);

  // 401 에러 처리: 세션 만료
  if (response.status === 401) {
    console.log("세션이 만료되었습니다. 로그인 페이지로 이동합니다.");
    
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      // 현재 페이지가 로그인/회원가입 페이지가 아닌 경우에만 리다이렉트
      if (!window.location.pathname.startsWith("/login") && 
          !window.location.pathname.startsWith("/signup")) {
        window.location.href = "/login";
      }
    }
    
    const error = new Error("인증이 만료되었습니다.");
    (error as any).status = 401;
    throw error;
  }

  return response;
}

/**
 * JSON 응답을 파싱하는 헬퍼 함수
 */
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
