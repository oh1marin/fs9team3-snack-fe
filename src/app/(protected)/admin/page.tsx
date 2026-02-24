"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  sendInvitationAPI,
  fetchUsersAPI,
  updateUserRoleAPI,
  deleteUserAPI,
  fetchBudgetCurrentAPI,
  updateBudgetCurrentAPI,
  type SuperAdminUser,
} from "@/lib/api/superAdmin";

type Tab = "members" | "budget";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tabFromUrl = (
    searchParams.get("tab") === "budget" ? "budget" : "members"
  ) as Tab;
  const [tab, setTab] = useState<Tab>(tabFromUrl);

  useEffect(() => {
    setTab(tabFromUrl);
  }, [tabFromUrl]);

  const rawAdmin =
    user?.is_admin ?? (user as { isAdmin?: string | boolean })?.isAdmin;
  const isAdmin =
    rawAdmin === "Y" ||
    rawAdmin === "y" ||
    rawAdmin === true ||
    String(rawAdmin ?? "").toLowerCase() === "true";
  const isSuperAdmin = user?.is_super_admin === "Y";

  if (!isSuperAdmin && !isAdmin) {
    router.replace("/items");
    return null;
  }

  return (
    <main className="mx-auto min-h-[50vh] w-full max-w-[1920px] bg-background-peach px-4 py-8 sm:px-6">
      <nav className="mb-8 flex gap-8 border-b border-line-gray">
        <Link
          href="/admin?tab=members"
          onClick={(e) => {
            e.preventDefault();
            setTab("members");
          }}
          className={`border-b-2 pb-3 text-base font-semibold transition-colors ${
            tab === "members"
              ? "border-primary-400 text-primary-400"
              : "border-transparent text-gray-500 hover:text-primary-400"
          }`}
        >
          회원 관리
        </Link>
        <Link
          href="/admin?tab=budget"
          onClick={(e) => {
            e.preventDefault();
            setTab("budget");
          }}
          className={`border-b-2 pb-3 text-base font-semibold transition-colors ${
            tab === "budget"
              ? "border-primary-400 text-primary-400"
              : "border-transparent text-gray-500 hover:text-primary-400"
          }`}
        >
          예산 관리
        </Link>
      </nav>

      {tab === "members" && (
        <MembersSection isSuperAdmin={isSuperAdmin} currentUserId={user?.id} />
      )}
      {tab === "budget" && <BudgetSection />}
    </main>
  );
}

function getPermissionLabel(u: SuperAdminUser): string {
  if (u.is_super_admin === "Y") return "최고관리자";
  if (u.is_admin === "Y") return "관리자";
  return "일반";
}

function getPermissionClass(u: SuperAdminUser): string {
  if (u.is_super_admin === "Y") return "text-base font-medium text-primary-400";
  if (u.is_admin === "Y") return "text-base font-medium text-primary-400";
  return "text-base text-gray-500";
}

function MembersSection({
  isSuperAdmin,
  currentUserId,
}: {
  isSuperAdmin: boolean;
  currentUserId?: string;
}) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "general">("general");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [roleEditUser, setRoleEditUser] = useState<SuperAdminUser | null>(null);
  const [roleEditIsAdmin, setRoleEditIsAdmin] = useState<"Y" | "N">("N");
  const [roleEditIsSuperAdmin, setRoleEditIsSuperAdmin] = useState<"Y" | "N">(
    "N",
  );
  const [roleEditSaving, setRoleEditSaving] = useState(false);
  const [roleEditRoleOpen, setRoleEditRoleOpen] = useState(false);
  const [inviteRoleOpen, setInviteRoleOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SuperAdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roleEditRoleRef = useRef<HTMLLabelElement>(null);
  const inviteRoleRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        roleEditRoleRef.current &&
        !roleEditRoleRef.current.contains(e.target as Node)
      )
        setRoleEditRoleOpen(false);
      if (
        inviteRoleRef.current &&
        !inviteRoleRef.current.contains(e.target as Node)
      )
        setInviteRoleOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const loadUsers = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchUsersAPI();
      const list = (res.users ?? []).filter((u) => u.is_super_admin !== "Y");
      setUsers(list);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "회원 목록을 불러오지 못했습니다.";
      setUsers([]);
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) loadUsers();
    else setUsers([]);
  }, [isSuperAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const searchLower = search.trim().toLowerCase();
  const filteredUsers = searchLower
    ? users.filter(
        (u) =>
          (u.email ?? "").toLowerCase().includes(searchLower) ||
          (u.nickname ?? "").toLowerCase().includes(searchLower),
      )
    : users;

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      toast.error("이메일을 입력해 주세요.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("올바른 이메일 형식이 아닙니다.");
      return;
    }
    setInviteLoading(true);
    try {
      await sendInvitationAPI(email);
      toast.success("초대 이메일을 발송했습니다.");
      setInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("general");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "초대 발송에 실패했습니다.",
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const openRoleEdit = (u: SuperAdminUser) => {
    setRoleEditRoleOpen(false);
    setRoleEditUser(u);
    setRoleEditIsAdmin((u.is_admin === "Y" ? "Y" : "N") as "Y" | "N");
    setRoleEditIsSuperAdmin(
      (u.is_super_admin === "Y" ? "Y" : "N") as "Y" | "N",
    );
  };

  const handleRoleEditSave = async () => {
    if (!roleEditUser) return;
    setRoleEditSaving(true);
    try {
      await updateUserRoleAPI(roleEditUser.id, {
        is_admin: roleEditIsAdmin,
        is_super_admin: roleEditIsSuperAdmin,
      });
      toast.success("등급이 수정되었습니다.");
      setRoleEditUser(null);
      loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "등급 수정에 실패했습니다.",
      );
    } finally {
      setRoleEditSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUserAPI(deleteTarget.id);
      toast.success("계정이 탈퇴 처리되었습니다.");
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "계정 탈퇴에 실패했습니다.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const isCurrentUser = (u: SuperAdminUser) =>
    currentUserId != null && u.id === currentUserId;

  return (
    <section>
      <h1 className="text-2xl-b text-black-500">회원 관리</h1>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
        <div className="relative w-64 min-w-[200px] max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름으로 검색하세요"
            className="h-12 w-full rounded-xl border border-line-gray bg-white pl-11 pr-4 text-base text-black-400 outline-none placeholder:text-gray-400 focus:border-primary-400"
          />
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => {
              setInviteRoleOpen(false);
              setInviteOpen(true);
            }}
            className="h-12 shrink-0 rounded-xl bg-primary-400 px-6 font-semibold text-white transition-colors hover:bg-primary-300"
          >
            회원 초대하기
          </button>
        )}
      </div>

      <div
        className="mt-6 min-w-[820px] overflow-x-auto"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr 1fr 1.5fr",
        }}
      >
        <div
          className="flex h-[80px] items-center justify-center rounded-l-[100px] border-b border-l border-t border-gray-200 bg-white pl-5 text-center text-base font-semibold text-black-400"
          style={{
            borderColor: "var(--color-gray-200, #E0E0E0)",
            background: "var(--color-gray-50, #FFF)",
          }}
        >
          이름
        </div>
        <div
          className="flex h-[80px] items-center justify-center border-b border-t border-gray-200 bg-white text-center text-base font-semibold text-black-400"
          style={{
            borderColor: "var(--color-gray-200, #E0E0E0)",
            background: "var(--color-gray-50, #FFF)",
          }}
        >
          메일
        </div>
        <div
          className="flex h-[80px] items-center justify-end border-b border-t border-gray-200 bg-white pr-3 text-base font-semibold text-black-400"
          style={{
            borderColor: "var(--color-gray-200, #E0E0E0)",
            background: "var(--color-gray-50, #FFF)",
          }}
        >
          권한
        </div>
        <div
          className="flex h-[80px] items-center justify-center rounded-r-[100px] border-b border-r border-t border-gray-200 bg-white text-base font-semibold text-black-400"
          style={{
            borderColor: "var(--color-gray-200, #E0E0E0)",
            background: "var(--color-gray-50, #FFF)",
          }}
        >
          비고
        </div>

        {loading ? (
          <div className="col-span-4 flex h-32 animate-pulse items-center justify-center border-b border-line-gray bg-gray-200/30" />
        ) : loadError ? (
          <div className="col-span-4 flex h-32 items-center justify-center gap-2 border-b border-line-gray text-base text-gray-500">
            {loadError}
            <button
              type="button"
              onClick={() => loadUsers()}
              className="text-primary-400 hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-4 flex flex-col items-center justify-center border-b border-line-gray py-12">
            <Image
              src="/DOGpen.png"
              alt=""
              width={388}
              height={488}
              className="h-auto w-[388px] max-w-full object-contain"
            />
          </div>
        ) : (
          pagedUsers.flatMap((m) => [
            <div
              key={`${m.id}-1`}
              className="flex h-20 items-center justify-center gap-2 border-b border-line-gray text-base text-black-400"
            >
              <Image
                src={
                  getPermissionLabel(m) === "일반"
                    ? "/man.png"
                    : "/orangeman.png"
                }
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 object-contain"
              />
              <span>{m.nickname || "회원"}</span>
            </div>,
            <div
              key={`${m.id}-2`}
              className="flex h-20 items-center justify-center border-b border-line-gray text-base text-black-400"
            >
              {m.email}
            </div>,
            <div
              key={`${m.id}-3`}
              className="flex h-20 items-center justify-end border-b border-line-gray pr-3 text-base"
            >
              <span
                className="shrink-0 rounded-lg border px-2 py-0.5 text-center text-sm font-semibold"
                style={
                  getPermissionLabel(m) === "일반"
                    ? {
                        color: "var(--color-gray-500, #6B7280)",
                        borderColor: "var(--color-gray-200, #E5E7EB)",
                        background: "var(--color-gray-100, #F3F4F6)",
                      }
                    : {
                        color: "var(--Primary-orange-400, #F97B22)",
                        borderColor: "var(--Primary-orange-200, #FDE1CD)",
                        background: "var(--Primary-orange-100, #FEF3EB)",
                      }
                }
              >
                {getPermissionLabel(m)}
              </span>
            </div>,
            <div
              key={`${m.id}-4`}
              className="flex h-20 items-center justify-center gap-2 border-b border-line-gray text-center text-base"
            >
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(m)}
                  disabled={isCurrentUser(m)}
                  className="rounded-lg border border-line-gray bg-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    isCurrentUser(m)
                      ? "본인 계정은 탈퇴할 수 없습니다."
                      : undefined
                  }
                >
                  계정 탈퇴
                </button>
              )}
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => openRoleEdit(m)}
                  className="rounded-lg bg-primary-400 px-4 py-2 text-sm font-medium text-white hover:bg-primary-300"
                >
                  권한 변경
                </button>
              )}
            </div>,
          ])
        )}
      </div>

      {!loading && filteredUsers.length > 0 && totalPages >= 1 && (
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex h-11 w-11 items-center justify-center rounded text-base font-normal text-black-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCurrentPage(n)}
              className={`flex h-11 min-w-[2.75rem] items-center justify-center rounded px-2.5 text-base ${currentPage === n ? "font-bold text-black-400" : "font-normal text-black-400 hover:bg-gray-100"}`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex h-11 w-11 items-center justify-center rounded text-base font-normal text-black-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </div>
      )}

      {roleEditUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !roleEditSaving && setRoleEditUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-edit-modal-title"
        >
          <div
            className="flex h-[672px] w-[688px] max-w-[95vw] flex-col rounded-[32px] bg-[#FBF8F4] p-10"
            style={{
              boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pb-5"
              style={{
                borderBottom: "1px solid var(--Primary-orange-300, #FCC49C)",
              }}
            >
              <h3
                id="role-edit-modal-title"
                className="text-xl font-bold text-black-400"
              >
                회원 권한 변경
              </h3>
            </div>
            <div className="mt-10 flex flex-1 flex-col space-y-10">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-black-400">이름</span>
                <input
                  type="text"
                  readOnly
                  value={roleEditUser.nickname ?? ""}
                  className="h-16 w-full rounded-[16px] border border-[#FCC49C] bg-[#FFF] px-4 text-base text-black-400"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-black-400">
                  이메일
                </span>
                <input
                  type="email"
                  readOnly
                  value={roleEditUser.email}
                  className="h-16 w-full rounded-[16px] border border-[#FCC49C] bg-[#FFF] px-4 text-base text-black-400"
                />
              </label>
              <label
                ref={roleEditRoleRef}
                className="relative flex flex-col gap-2"
              >
                <span className="text-sm font-medium text-black-400">권한</span>
                <button
                  type="button"
                  onClick={() => setRoleEditRoleOpen((o) => !o)}
                  className="flex h-16 w-full items-center justify-between rounded-[16px] border border-[#FCC49C] bg-[#FFF] px-4 text-base text-black-400 outline-none focus:border-primary-400"
                >
                  <span>{roleEditIsAdmin === "Y" ? "관리자" : "일반"}</span>
                  {roleEditRoleOpen ? (
                    <Image
                      src="/orangeup.png"
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0 object-contain"
                    />
                  ) : (
                    <Image
                      src="/orangedown2.png"
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0 object-contain"
                    />
                  )}
                </button>
                {roleEditRoleOpen && (
                  <div
                    className="absolute top-full left-0 z-10 mt-1 max-h-[320px] w-full overflow-y-auto rounded-[16px] border border-[#FCC49C] bg-[#FFF] py-1"
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  >
                    {[
                      { value: "general", label: "일반" },
                      { value: "admin", label: "관리자" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setRoleEditIsSuperAdmin("N");
                          setRoleEditIsAdmin(opt.value === "admin" ? "Y" : "N");
                          setRoleEditRoleOpen(false);
                        }}
                        className="flex h-[68px] w-full items-center border-b border-gray-200 px-4 text-left text-base text-black-400 last:border-b-0 hover:bg-[#FEF3EB]"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </label>
            </div>
            <div className="mt-10 flex justify-center gap-6">
              <button
                type="button"
                onClick={() => !roleEditSaving && setRoleEditUser(null)}
                className="flex h-14 flex-1 max-w-[260px] items-center justify-center rounded-xl bg-[#FDF0DF] font-medium text-primary-400 transition-colors hover:opacity-90"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRoleEditSave}
                disabled={roleEditSaving}
                className="flex h-14 flex-1 max-w-[300px] items-center justify-center rounded-xl bg-primary-400 font-medium text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              >
                {roleEditSaving ? "변경 중..." : "변경하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !deleteLoading && setDeleteTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="inline-flex h-[560px] w-[704px] max-w-[95vw] flex-col items-center justify-center gap-12 rounded-[32px] bg-[#FBF8F4]"
            style={{
              padding: "40px 32px",
              boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/DOG!.png"
              alt=""
              width={260}
              height={200}
              className="h-auto w-full max-w-[260px] object-contain"
            />
            <h2
              id="delete-modal-title"
              className="text-xl font-bold text-black-400"
            >
              계정 탈퇴
            </h2>
            <p className="text-center text-base text-black-400">
              {deleteTarget.nickname || "회원"}({deleteTarget.email})님의 계정을
              탈퇴시킬까요?
            </p>
            <div className="flex flex-row flex-nowrap justify-center gap-4">
              <button
                type="button"
                onClick={() => !deleteLoading && setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex h-16 w-[310px] flex-shrink-0 items-center justify-center rounded-2xl bg-[#FDF0DF] p-4 font-medium text-primary-400 transition-colors hover:bg-[#FDF0DF]/90 disabled:opacity-50"
              >
                더 생각해볼게요
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex h-16 w-[310px] flex-shrink-0 items-center justify-center rounded-2xl bg-primary-400 p-4 font-medium text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              >
                {deleteLoading ? "처리 중..." : "탈퇴시키기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {inviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !inviteLoading && setInviteOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <div
            className="flex h-[672px] w-[688px] max-w-[95vw] flex-col rounded-[32px] bg-[#FBF8F4] p-10"
            style={{
              boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pb-5"
              style={{
                borderBottom: "1px solid var(--Primary-orange-300, #FCC49C)",
              }}
            >
              <h3
                id="invite-modal-title"
                className="text-xl font-bold text-black-400"
              >
                회원 초대
              </h3>
            </div>
            <div className="mt-10 flex flex-1 flex-col space-y-10">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-black-400">이름</span>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="이름을 입력해주세요"
                  className="h-16 w-full rounded-[16px] border border-[#FCC49C] bg-[#FFF] px-4 text-base outline-none placeholder:text-gray-400 focus:border-primary-400"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-black-400">
                  이메일
                </span>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="이메일을 입력해주세요"
                  className="h-16 w-full rounded-[16px] border border-[#FCC49C] bg-[#FFF] px-4 text-base outline-none placeholder:text-gray-400 focus:border-primary-400"
                  onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                />
              </label>
              <label
                ref={inviteRoleRef}
                className="relative flex flex-col gap-2"
              >
                <span className="text-sm font-medium text-black-400">권한</span>
                <button
                  type="button"
                  onClick={() => setInviteRoleOpen((o) => !o)}
                  className="flex h-16 w-full items-center justify-between rounded-[16px] border border-[#FCC49C] bg-[#FFF] px-4 text-base text-black-400 outline-none focus:border-primary-400"
                >
                  <span>{inviteRole === "admin" ? "관리자" : "일반"}</span>
                  {inviteRoleOpen ? (
                    <Image
                      src="/orangeup.png"
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0 object-contain"
                    />
                  ) : (
                    <Image
                      src="/orangedown2.png"
                      alt=""
                      width={20}
                      height={20}
                      className="shrink-0 object-contain"
                    />
                  )}
                </button>
                {inviteRoleOpen && (
                  <div
                    className="absolute top-full left-0 z-10 mt-1 max-h-[320px] w-full overflow-y-auto rounded-[16px] border border-[#FCC49C] bg-[#FFF] py-1"
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  >
                    {[
                      { value: "general" as const, label: "일반" },
                      { value: "admin" as const, label: "관리자" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setInviteRole(opt.value);
                          setInviteRoleOpen(false);
                        }}
                        className="flex h-[68px] w-full items-center border-b border-gray-200 px-4 text-left text-base text-black-400 last:border-b-0 hover:bg-[#FEF3EB]"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </label>
            </div>
            <div className="mt-10 flex justify-center gap-6">
              <button
                type="button"
                onClick={() => !inviteLoading && setInviteOpen(false)}
                className="flex h-14 flex-1 max-w-[260px] items-center justify-center rounded-xl bg-[#FDF0DF] font-medium text-primary-400 transition-colors hover:opacity-90"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={inviteLoading}
                className="flex h-14 flex-1 max-w-[300px] items-center justify-center rounded-xl bg-primary-400 font-medium text-white transition-colors hover:bg-primary-300 disabled:opacity-50"
              >
                {inviteLoading ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function formatBudgetAmount(n: number | undefined): string {
  if (n === undefined || n === null) return "";
  return n.toLocaleString("ko-KR");
}

const MAX_BUDGET = 100_000_000; // 1억 원

function parseBudgetInput(s: string): number {
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

function BudgetSection() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [startingBudget, setStartingBudget] = useState("");
  const [saving, setSaving] = useState(false);

  const loadBudget = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetchBudgetCurrentAPI();
      const b = res.budget ?? {};
      const init = res.initial_budget;
      setMonthlyBudget(
        b.budget_amount != null ? formatBudgetAmount(b.budget_amount) : "",
      );
      setStartingBudget(
        init?.amount != null ? formatBudgetAmount(init.amount) : "",
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "예산 정보를 불러오지 못했습니다.";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudget();
  }, []);

  const budgetAmount = parseBudgetInput(monthlyBudget);
  const initialBudget = parseBudgetInput(startingBudget);
  const isMonthlyOver = budgetAmount > MAX_BUDGET;
  const isStartingOver = initialBudget > MAX_BUDGET;
  const isBudgetOverLimit = isMonthlyOver || isStartingOver;

  const handleSave = async () => {
    if (isBudgetOverLimit) {
      toast.error("예산은 1억 원을 초과할 수 없습니다.");
      return;
    }
    const body: { budget_amount?: number; initial_budget?: number } = {};
    if (budgetAmount >= 0) body.budget_amount = budgetAmount;
    if (initialBudget >= 0) body.initial_budget = initialBudget;
    if (Object.keys(body).length === 0) {
      toast.info("변경할 값을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      await updateBudgetCurrentAPI(body);
      toast.success("예산이 수정되었습니다.", {
        containerId: "budget-toast",
        className: "toast-budget-orange",
      });
      loadBudget();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "예산 수정에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col items-center">
      <h1 className="w-full text-center text-2xl-b text-black-500">
        예산 관리
      </h1>

      {loading ? (
        <div className="mt-8 h-32 w-full max-w-[640px] animate-pulse rounded-xl bg-gray-200/30" />
      ) : loadError ? (
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-gray-500">{loadError}</p>
          <button
            type="button"
            onClick={() => loadBudget()}
            className="rounded-xl bg-primary-400 px-6 py-2.5 font-medium text-white hover:bg-primary-300"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="mt-8 flex w-[640px] max-w-full flex-col items-center gap-6">
          <div className="w-full border-b border-line-gray" />
          <label className="flex w-full flex-col items-start gap-2">
            <span className="text-base font-medium text-black-400">
              이번 달 예산
            </span>
            <input
              type="text"
              value={monthlyBudget}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setMonthlyBudget(
                  v ? parseInt(v, 10).toLocaleString("ko-KR") : "",
                );
              }}
              className={`h-16 w-full rounded-2xl border-2 px-4 text-left text-base outline-none placeholder:text-gray-400 focus:border-primary-400 ${
                isMonthlyOver
                  ? "border-red-500 text-red-600 bg-white"
                  : "border-[#FCC49C] text-black-400 bg-white"
              }`}
              style={{
                borderRadius: "16px",
              }}
            />
            {isMonthlyOver && (
              <span className="text-sm font-medium text-red-600">
                예산은 1억 원을 초과할 수 없습니다.
              </span>
            )}
          </label>
          <label className="flex w-full flex-col items-start gap-2">
            <span className="text-base font-medium text-black-400">
              매달 시작 예산
            </span>
            <input
              type="text"
              value={startingBudget}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                setStartingBudget(
                  v ? parseInt(v, 10).toLocaleString("ko-KR") : "",
                );
              }}
              className={`h-16 w-full rounded-2xl border-2 px-4 text-left text-base outline-none placeholder:text-gray-400 focus:border-primary-400 ${
                isStartingOver
                  ? "border-red-500 text-red-600 bg-white"
                  : "border-[#FCC49C] text-black-400 bg-white"
              }`}
              style={{
                borderRadius: "16px",
              }}
            />
            {isStartingOver && (
              <span className="text-sm font-medium text-red-600">
                예산은 1억 원을 초과할 수 없습니다.
              </span>
            )}
          </label>
          <div className="w-full border-b border-line-gray" />
          <div className="mt-4 flex w-full justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isBudgetOverLimit}
              className="h-16 w-full max-w-[640px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderRadius: "16px",
                background: isBudgetOverLimit
                  ? "#9CA3AF"
                  : "var(--Primary-orange-400, #F97B22)",
              }}
            >
              {saving ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
