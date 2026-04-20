"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { studentSidebarItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

function isNavItemActive(pathname: string, currentSearch: string, href: string) {
  if (!href.includes("?")) {
    return pathname === href;
  }

  const [targetPath, queryString] = href.split("?");
  if (pathname !== targetPath) {
    return false;
  }

  const params = new URLSearchParams(queryString);
  const currentParams = new URLSearchParams(currentSearch);
  for (const [key, value] of params.entries()) {
    if (currentParams.get(key) !== value) {
      return false;
    }
  }

  return true;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { status, user } = useAuthSession();
  const [currentSearch, setCurrentSearch] = useState("");

  useEffect(() => {
    setCurrentSearch(window.location.search);
  }, []);

  if (status !== "authenticated" || !user) {
    return null;
  }

  return (
    <aside className="hidden xl:block xl:w-[280px]">
      <div className="sticky top-28 rounded-[2rem] border border-white/80 bg-white/94 p-4 shadow-soft">
        <div className="mb-4 px-3">
          <div className="text-xs font-semibold tracking-[0.18em] text-slate-400">STUDENT SPACE</div>
          <div className="mt-2 display-font text-xl font-bold text-slate-950">مساحتك داخل معيار</div>
        </div>

        <div className="space-y-2">
          {studentSidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, currentSearch, item.href);

            return (
              <Link key={item.href} href={item.href} className={cn("nav-item", active && "nav-item-active")}>
                <span className={cn("nav-icon-wrap", item.iconWrap, item.accent)}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div>{item.label}</div>
                  {item.description ? (
                    <div className="text-xs font-medium text-slate-400">{item.description}</div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
