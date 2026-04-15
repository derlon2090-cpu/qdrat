import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[1.25rem] border text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[linear-gradient(135deg,#123B7A,#0f2f61)] text-white shadow-[0_10px_0_rgba(8,31,68,0.22)] hover:-translate-y-0.5",
        outline:
          "border-[#d8c7a7] bg-white/92 text-slate-900 shadow-[0_8px_0_rgba(201,161,91,0.10)] hover:-translate-y-0.5 hover:bg-white",
        secondary:
          "border-transparent bg-[linear-gradient(135deg,#D9A441,#C99200)] text-white shadow-[0_10px_0_rgba(164,116,12,0.22)] hover:-translate-y-0.5",
        ghost: "border-transparent bg-transparent text-slate-700 hover:bg-white/70",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 px-4 text-xs",
        lg: "h-[3.8rem] px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
