import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-indigo-200 bg-white/92 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
