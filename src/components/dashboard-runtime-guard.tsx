"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardRuntimeGuardProps = {
  children: ReactNode;
  onRetry?: () => void;
  resetKey?: string;
};

type DashboardRuntimeGuardState = {
  hasError: boolean;
};

export class DashboardRuntimeGuard extends Component<
  DashboardRuntimeGuardProps,
  DashboardRuntimeGuardState
> {
  state: DashboardRuntimeGuardState = {
    hasError: false,
  };

  static getDerivedStateFromError(): DashboardRuntimeGuardState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard runtime guard caught an error.", error, info);
  }

  componentDidUpdate(prevProps: DashboardRuntimeGuardProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Card className="border border-rose-200 bg-rose-50/80 shadow-[0_18px_42px_rgba(244,63,94,0.08)]">
        <CardContent className="space-y-5 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-white text-rose-600 shadow-sm">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="display-font text-2xl font-bold text-slate-950 sm:text-3xl">
              تعذر فتح هذه المساحة الآن
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-8 text-slate-600">
              حصل خلل غير متوقع أثناء تجهيز هذا الجزء من لوحة الطالب. يمكنك إعادة
              المحاولة مباشرة أو الانتقال مؤقتًا إلى الخطة اليومية أو بنك الأسئلة.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={this.handleRetry} className="w-full gap-2 sm:w-auto">
              <RefreshCcw className="h-4 w-4" />
              إعادة المحاولة
            </Button>

            <Link
              href="/my-plan"
              className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 sm:w-auto")}
            >
              <ArrowLeft className="h-4 w-4" />
              الذهاب إلى الخطة اليومية
            </Link>

            <Link
              href="/question-bank"
              className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2 sm:w-auto")}
            >
              <ArrowLeft className="h-4 w-4" />
              الذهاب إلى بنك الأسئلة
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
}
