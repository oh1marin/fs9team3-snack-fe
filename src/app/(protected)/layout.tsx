"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, [router, user]);

  if (isChecking) {
    return null;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
