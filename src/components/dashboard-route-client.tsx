"use client";

import dynamic from "next/dynamic";

import { DashboardRouteLoading } from "@/components/dashboard-route-loading";

const DashboardShell = dynamic(
  () => import("@/components/dashboard-shell").then((module) => module.DashboardShell),
  {
    ssr: false,
    loading: () => <DashboardRouteLoading />,
  },
);

export function DashboardRouteClient() {
  return <DashboardShell />;
}
