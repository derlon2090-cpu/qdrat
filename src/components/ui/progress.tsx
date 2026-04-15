import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200/80", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-[linear-gradient(90deg,#16213f,#7568ff,#d2a85a)] transition-all",
          indicatorClassName,
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
