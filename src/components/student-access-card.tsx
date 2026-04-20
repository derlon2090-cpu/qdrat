"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function StudentAccessCard({
  title,
  description,
  next,
}: {
  title: string;
  description: string;
  next: string;
}) {
  return (
    <Card className="border border-dashed border-[#d8c7a7] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,229,0.9))]">
      <CardContent className="space-y-6 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#fff7ed] text-[#C99A43]">
          <LockKeyhole className="h-8 w-8" />
        </div>
        <div>
          <h2 className="display-font text-2xl font-bold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-8 text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/login?next=${encodeURIComponent(next)}`}>
            <Button variant="outline">تسجيل الدخول</Button>
          </Link>
          <Link href={`/register?next=${encodeURIComponent(next)}`}>
            <Button>إنشاء حساب</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
