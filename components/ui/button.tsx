import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-orange-brand text-white shadow-lg shadow-orange-brand/25 hover:bg-[#d14a0a] hover:shadow-orange-brand/40 hover:-translate-y-0.5",
        teal: "bg-teal-brand text-white shadow-lg shadow-teal-brand/25 hover:bg-[#006666] hover:-translate-y-0.5",
        outline:
          "border-2 border-border bg-transparent hover:bg-muted hover:-translate-y-0.5 text-foreground",
        ghost: "hover:bg-muted text-foreground",
        link: "text-teal-brand underline-offset-4 hover:underline",
        secondary:
          "bg-muted text-foreground hover:bg-muted/70 hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
