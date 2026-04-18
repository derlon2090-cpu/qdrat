"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuthSessionPayload } from "@/lib/auth-shared";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";
const SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function useAuthSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<AuthSessionPayload>({
    authenticated: false,
    user: null,
  });

  const refreshSession = useCallback(async () => {
    setStatus((current) => (current === "authenticated" ? current : "loading"));

    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });

      const payload = (await response.json()) as AuthSessionPayload;
      const authenticated = Boolean(payload.authenticated && payload.user);

      setSession({
        authenticated,
        user: authenticated ? payload.user : null,
      });
      setStatus(authenticated ? "authenticated" : "unauthenticated");
    } catch {
      setSession({
        authenticated: false,
        user: null,
      });
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }, SESSION_REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(intervalId);
    };
  }, [refreshSession]);

  return {
    status,
    session,
    user: session.user,
    refreshSession,
  };
}
