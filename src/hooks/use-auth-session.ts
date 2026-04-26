"use client";

import { useCallback, useEffect, useState } from "react";

import type { AuthSessionPayload } from "@/lib/auth-shared";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";
const SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const SESSION_UPDATED_EVENT = "miyaar:session-updated";
type SessionUpdatedEventDetail = Partial<AuthSessionPayload> | undefined;

export function useAuthSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<AuthSessionPayload>({
    authenticated: false,
    user: null,
  });

  const applySessionPayload = useCallback((payload: AuthSessionPayload) => {
    const authenticated = Boolean(payload.authenticated && payload.user);

    setSession({
      authenticated,
      user: authenticated ? payload.user : null,
      expiresAt: payload.expiresAt ?? null,
    });
    setStatus(authenticated ? "authenticated" : "unauthenticated");
  }, []);

  const refreshSession = useCallback(async () => {
    setStatus((current) => (current === "authenticated" ? current : "loading"));

    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });

      const payload = (await response.json()) as AuthSessionPayload;
      applySessionPayload(payload);
    } catch {
      applySessionPayload({
        authenticated: false,
        user: null,
      });
    }
  }, [applySessionPayload]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    function refreshAfterSessionUpdate(event: Event) {
      const detail = (event as CustomEvent<SessionUpdatedEventDetail>).detail;

      if (detail && "authenticated" in detail) {
        applySessionPayload({
          authenticated: Boolean(detail.authenticated && detail.user),
          user: detail.authenticated ? detail.user ?? null : null,
          expiresAt: detail.expiresAt ?? null,
        });
        return;
      }

      void refreshSession();
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }

    window.addEventListener(SESSION_UPDATED_EVENT, refreshAfterSessionUpdate);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }, SESSION_REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener(SESSION_UPDATED_EVENT, refreshAfterSessionUpdate);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(intervalId);
    };
  }, [applySessionPayload, refreshSession]);

  return {
    status,
    session,
    user: session.user,
    refreshSession,
  };
}
