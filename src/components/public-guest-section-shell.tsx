import Link from "next/link";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { SiteFooter } from "@/components/site-footer";
import { cn } from "@/lib/utils";

type PublicGuestSectionShellProps = {
  active?: "home" | "plans" | "faq" | "contact";
  children: React.ReactNode;
};

const guestNavItems = [
  { href: "/", label: "الصفحة الرئيسية", id: "home" },
  { href: "/plans", label: "الخطط", id: "plans" },
  { href: "/faq", label: "الأسئلة الشائعة", id: "faq" },
  { href: "/contact", label: "تواصل معنا", id: "contact" },
] as const;

export function PublicGuestSectionShell({
  active = "home",
  children,
}: PublicGuestSectionShellProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f7faff] text-[#102247]">
      <div className="mx-auto w-[min(calc(100%-1.5rem),1380px)] pt-6 sm:w-[min(calc(100%-2.5rem),1380px)]">
        <header className="rounded-[1.5rem] border border-[#e8eef9] bg-white px-6 py-4 shadow-[0_18px_55px_rgba(15,34,71,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <MiyaarLogo href="/" className="justify-center lg:justify-start" />

            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.95rem] font-semibold text-[#5d6d86]">
              {guestNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition hover:text-[#2563eb]",
                    active === item.id && "text-[#2563eb]",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/login"
              className="mx-auto inline-flex h-10 items-center justify-center rounded-[0.7rem] bg-[#eef4ff] px-5 text-sm font-bold text-[#2563eb] transition hover:bg-[#2563eb] hover:text-white lg:mx-0"
            >
              تسجيل الدخول
            </Link>
          </div>
        </header>
      </div>

      <main className="mx-auto w-[min(calc(100%-1.5rem),1380px)] py-8 sm:w-[min(calc(100%-2.5rem),1380px)]">
        {children}
      </main>

      <SiteFooter variant="public" />
    </div>
  );
}
