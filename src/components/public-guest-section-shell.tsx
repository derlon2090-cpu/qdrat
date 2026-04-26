import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PublicGuestSectionShellProps = {
  active?: "home" | "plans" | "faq" | "contact";
  children: React.ReactNode;
};

export function PublicGuestSectionShell({
  children,
}: PublicGuestSectionShellProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f7faff] text-[#102247]">
      <SiteHeader variant="public" />

      <main className="mx-auto w-[min(calc(100%-1.5rem),1380px)] py-8 sm:w-[min(calc(100%-2.5rem),1380px)]">
        {children}
      </main>

      <SiteFooter variant="public" />
    </div>
  );
}
