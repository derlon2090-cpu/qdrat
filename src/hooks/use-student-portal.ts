"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { StudentPortalData } from "@/lib/student-portal";

type PortalStatus = "idle" | "loading" | "ready" | "error";

const FALLBACK_PORTAL_ERROR = "تعذر تحميل لوحة الطالب.";

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export function useStudentPortal(enabled = true) {
  const [status, setStatus] = useState<PortalStatus>(enabled ? "loading" : "idle");
  const [data, setData] = useState<StudentPortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const latestDataRef = useRef<StudentPortalData | null>(null);

  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setStatus("idle");
      setError(null);
      setIsRefreshing(false);
      return null;
    }

    const cachedData = latestDataRef.current;

    setIsRefreshing(true);
    setError(null);

    if (!cachedData) {
      setStatus("loading");
    }

    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await fetch("/api/student/portal", {
            cache: "no-store",
          });

          const payload = (await response.json()) as {
            ok?: boolean;
            data?: StudentPortalData;
            message?: string;
          };

          if (!response.ok || !payload.ok || !payload.data) {
            throw new Error(payload.message ?? FALLBACK_PORTAL_ERROR);
          }

          setData(payload.data);
          latestDataRef.current = payload.data;
          setStatus("ready");
          return payload.data;
        } catch (attemptError) {
          if (attempt === 1) {
            throw attemptError;
          }

          await wait(1200);
        }
      }

      return null;
    } catch (portalError) {
      const message =
        portalError instanceof Error ? portalError.message : FALLBACK_PORTAL_ERROR;

      setError(message);

      if (cachedData) {
        setStatus("ready");
        return cachedData;
      }

      setStatus("error");
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  return {
    status,
    data,
    error,
    isRefreshing,
    refresh,
    setData,
  };
}
