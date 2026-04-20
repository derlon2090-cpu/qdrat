"use client";

import { useCallback, useEffect, useState } from "react";

import type { StudentPortalData } from "@/lib/student-portal";

type PortalStatus = "idle" | "loading" | "ready" | "error";

export function useStudentPortal(enabled = true) {
  const [status, setStatus] = useState<PortalStatus>(enabled ? "loading" : "idle");
  const [data, setData] = useState<StudentPortalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setStatus("idle");
      return null;
    }

    setStatus("loading");
    setError(null);

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
        throw new Error(payload.message ?? "تعذر تحميل لوحة الطالب.");
      }

      setData(payload.data);
      setStatus("ready");
      return payload.data;
    } catch (portalError) {
      setStatus("error");
      setError(portalError instanceof Error ? portalError.message : "تعذر تحميل لوحة الطالب.");
      return null;
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
    refresh,
    setData,
  };
}
