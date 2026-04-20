"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/hooks/use-auth-session";

export function HomeAuthRedirect() {
  const router = useRouter();
  const { status, user } = useAuthSession();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace("/dashboard");
    }
  }, [router, status, user]);

  return null;
}
