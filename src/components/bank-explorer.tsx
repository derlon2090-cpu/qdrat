"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { banks } from "@/data/miyaar";

type Bank = (typeof banks)[number];

const filters = [
  { value: "الكل", label: "الكل" },
  { value: "لفظي", label: "لفظي" },
  { value: "قطع", label: "قطع" },
];

export function BankExplorer({
  items,
  ctaHref = "/exam",
}: {
  items: Bank[];
  ctaHref?: string;
}) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("الكل");
  const deferredQuery = useDeferredValue(query);

  const filtered = items.filter((bank) => {
    const matchesType = activeType === "الكل" || bank.type === activeType;
    if (!deferredQuery.trim()) return matchesType;

    const haystack = `${bank.title} ${bank.level} ${bank.type} ${bank.tag}`;
    return matchesType && haystack.includes(deferredQuery.trim());
  });

  return (
    <Card className="rounded-[2.2rem]">
      <CardContent className="space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="grid w-full gap-2 md:max-w-md">
            <span className="text-sm font-medium text-slate-500">بحث داخل البنوك</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث: تناظر، قطعة، متوسط..."
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveType(filter.value)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  activeType === filter.value
                    ? "border-transparent bg-[linear-gradient(135deg,#16213f,#25345f)] text-white"
                    : "border-slate-200 bg-white/80 text-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {filtered.length ? (
            filtered.map((bank) => (
              <div
                key={bank.id}
                className="flex flex-col gap-4 rounded-[1.7rem] border border-slate-200/80 bg-white/75 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="display-font text-lg font-bold text-slate-950">{bank.title}</h3>
                    <Badge className="border-transparent bg-slate-950 text-white">{bank.type}</Badge>
                    <Badge className="bg-violet-50 text-violet-700">{bank.level}</Badge>
                    <Badge className="bg-amber-50 text-amber-700">{bank.tag}</Badge>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">
                    بنك جاهز للتدريب السريع، الاختبار المخصص، أو الإضافة مباشرة إلى
                    مسار الطالب اليومي.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left md:text-right">
                    <div className="display-font text-2xl font-bold text-slate-950">
                      {bank.count.toLocaleString("en-US")}
                    </div>
                    <div className="text-xs text-slate-500">سؤال</div>
                  </div>
                  <Link href={ctaHref}>
                    <Button>ابدأ التدريب</Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
              لا توجد نتائج مطابقة للبحث الحالي. جرّب كلمة أخرى أو غيّر نوع البنك.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
