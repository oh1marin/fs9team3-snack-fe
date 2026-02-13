import { checkAuth, getServerUser } from "@/lib/actions/auth";
import { redirect, RedirectType } from "next/navigation";
import AuthInitializer from "@/components/AuthInitializer";
import ProtectedUserSync from "@/components/ProtectedUserSync";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect("/login", RedirectType.replace);
  }

  const serverUser = await getServerUser();

  return (
    <>
      <AuthInitializer initialUser={serverUser} />
      <ProtectedUserSync />
      {children}
    </>
  );
}
