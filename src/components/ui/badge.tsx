import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-[#d8c7a7] bg-white/92 px-4 py-2 text-xs font-semibold text-[#123B7A] shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
