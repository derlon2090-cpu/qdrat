import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
  accentClass?: string;
  ctaLabel: string;
  ctaHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref={ctaHref} ctaLabel="ابدأ الآن" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto flex w-[min(calc(100%-2rem),1280px)] gap-8">
          <AppSidebar />

          <div className="min-w-0 flex-1 space-y-10">
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
                      <Link href={ctaHref}>
                        <Button>{ctaLabel}</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
