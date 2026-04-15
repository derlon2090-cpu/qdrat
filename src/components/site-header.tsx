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
  ctaLabel = "شاهد اللوحة",
}: {
  links: NavItem[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(calc(100%-2rem),1180px)] flex-wrap items-center justify-between gap-4 py-4">
        <MiyaarLogo />
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-600">
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
            <Button variant="outline">{ctaLabel}</Button>
          </Link>
          <Link href="/#cta">
            <Button>ابدأ الآن</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
