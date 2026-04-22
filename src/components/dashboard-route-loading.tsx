import { Card, CardContent } from "@/components/ui/card";

export function DashboardRouteLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="section-shell pt-8 pb-10 md:pt-10 md:pb-12">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)] space-y-6">
          <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6 sm:p-8">
              <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-5 w-full animate-pulse rounded-xl bg-slate-100" />
              <div className="h-5 w-5/6 animate-pulse rounded-xl bg-slate-100" />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-8 w-20 animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
