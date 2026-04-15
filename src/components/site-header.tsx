import Link from "next/link";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

export function SiteHeader({
  links,
  ctaHref = "/dashboard",
  ctaLabel = "ابدأ الآن",
}: {
  links: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/82 backdrop-blur-2xl">
      <div className="mx-auto flex w-[min(calc(100%-2rem),1180px)] items-center justify-between gap-4 py-4">
        <MiyaarLogo />
        <nav className="hidden items-center justify-center gap-6 text-sm font-semibold text-slate-600 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("transition hover:text-slate-950")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={ctaHref}>
            <Button>{ctaLabel}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
