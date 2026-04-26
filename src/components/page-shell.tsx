import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AuthSessionUser } from "@/lib/auth-shared";

export function PageShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  iconWrap,
  iconColor,
  accentClass,
  ctaLabel,
  ctaHref,
  headerVariant = "public",
  initialAuthUser,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
  accentClass?: string;
  ctaLabel?: string;
  ctaHref?: string;
  headerVariant?: "auto" | "public" | "student";
  initialAuthUser?: AuthSessionUser | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        variant={headerVariant}
        ctaHref={headerVariant === "public" ? undefined : ctaHref}
        ctaLabel={headerVariant === "public" ? undefined : ctaLabel}
        initialUser={initialAuthUser}
      />
      <main className="section-shell flex-1 pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-1rem),1480px)] space-y-10 sm:w-[min(calc(100%-2rem),1480px)]">
          <Reveal>
            <Card className="page-shell-card overflow-hidden rounded-[2.3rem] border-white/80 bg-white/95 shadow-soft">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-3xl">
                    <p className="section-eyebrow text-[#123B7A]">{eyebrow}</p>
                    <h1 className="page-heading">{title}</h1>
                    <p className="section-copy mb-0">{description}</p>
                  </div>

                  <div className="flex flex-col items-start gap-4 md:items-end">
                    <div
                      className={`page-shell-icon flex h-20 w-20 items-center justify-center rounded-[1.8rem] ${iconWrap} ${accentClass ?? ""}`}
                    >
                      <Icon className={`h-9 w-9 ${iconColor}`} />
                    </div>
                    {headerVariant !== "public" && ctaLabel && ctaHref ? (
                      <Link href={ctaHref}>
                        <Button>{ctaLabel}</Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {children}
        </div>
      </main>
      <SiteFooter variant={headerVariant === "public" ? "public" : headerVariant} />
    </div>
  );
}
