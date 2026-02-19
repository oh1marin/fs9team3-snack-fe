import { fetchJSON } from "./apiClient";

export interface SendInvitationResponse {
  success: boolean;
  message: string;
  email?: string;
}

/** 최고관리자: 초대 이메일 발송 (POST /api/super-admin/invitations) */
export async function sendInvitationAPI(
  email: string
): Promise<SendInvitationResponse> {
  return fetchJSON("/api/super-admin/invitations", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export interface SuperAdminUser {
  id: string;
  email: string;
  is_admin?: string;
  is_super_admin?: string;
  create_at?: string;
  updated_at?: string;
  nickname?: string;
}

export interface FetchUsersResponse {
  success: boolean;
  users: SuperAdminUser[];
  total: number;
}

/** 최고관리자: 회원 목록 조회 (GET /api/super-admin/users) */
export async function fetchUsersAPI(): Promise<FetchUsersResponse> {
  return fetchJSON("/api/super-admin/users", { method: "GET" });
}

export interface UpdateUserRoleBody {
  is_admin?: "Y" | "N";
  is_super_admin?: "Y" | "N";
}

export interface UpdateUserRoleResponse {
  success: boolean;
  message: string;
  user?: SuperAdminUser;
}

/** 최고관리자: 유저 등급 수정 (PATCH /api/super-admin/users/:id) */
export async function updateUserRoleAPI(
  userId: string,
  body: UpdateUserRoleBody
): Promise<UpdateUserRoleResponse> {
  return fetchJSON(`/api/super-admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  deleted?: { id: string; email: string };
}

/** 최고관리자: 유저 계정 탈퇴 (DELETE /api/super-admin/users/:id). 본인 계정은 삭제 불가. */
export async function deleteUserAPI(userId: string): Promise<DeleteUserResponse> {
  return fetchJSON(`/api/super-admin/users/${userId}`, {
    method: "DELETE",
  });
}

// --- 예산 관리 (node-cron으로 매월 1일 00:00에 해당 월 레코드 자동 생성) ---

export interface BudgetCurrent {
  year?: number;
  month?: number;
  budget_amount?: number;
  spent_amount?: number;
  remaining?: number;
  [key: string]: unknown;
}

export interface InitialBudgetDto {
  id?: string;
  amount?: number;
  updated_at?: string;
}

export interface FetchBudgetCurrentResponse {
  budget: BudgetCurrent;
  initial_budget?: InitialBudgetDto;
}

/** 최고관리자: 이번 달 예산 조회 (GET /api/super-admin/budget/current) */
export async function fetchBudgetCurrentAPI(): Promise<FetchBudgetCurrentResponse> {
  return fetchJSON("/api/super-admin/budget/current", { method: "GET" });
}

export interface UpdateBudgetCurrentBody {
  budget_amount?: number;
  initial_budget?: number;
  spent_amount?: number;
}

export interface UpdateBudgetCurrentResponse {
  success?: boolean;
  message?: string;
  budget?: BudgetCurrent;
}

/** 최고관리자: 이번 달 예산/사용액 수정 (PATCH /api/super-admin/budget/current) */
export async function updateBudgetCurrentAPI(
  body: UpdateBudgetCurrentBody
): Promise<UpdateBudgetCurrentResponse> {
  return fetchJSON("/api/super-admin/budget/current", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
