import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-soft",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Hero variants for landing page
        hero: "bg-secondary text-secondary-foreground font-semibold px-8 py-4 text-base hover:bg-secondary/90 shadow-gold hover:shadow-lg hover:scale-105 transition-all duration-300",
        heroOutline: "border-2 border-secondary text-secondary font-semibold px-8 py-4 text-base hover:bg-secondary/10 transition-all duration-300",
        // Premium gold button
        gold: "bg-gradient-gold text-secondary-foreground font-semibold hover:shadow-gold hover:scale-105 transition-all duration-300",
        // Accent terracotta button  
        accent: "bg-accent text-accent-foreground font-medium hover:bg-accent/90 hover:shadow-soft transition-all duration-300",
        // Navy button
        navy: "bg-gradient-navy text-primary-foreground font-medium hover:shadow-elevated transition-all duration-300",
        // Mobile-optimized buttons for seniors
        mobilePrimary: "min-h-[52px] text-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold rounded-xl px-6",
        mobileSecondary: "min-h-[48px] text-base font-medium bg-muted text-foreground hover:bg-muted/80 rounded-xl px-5",
        mobileGhost: "min-h-[48px] text-base font-medium hover:bg-muted/50 rounded-xl px-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        // Mobile sizes
        mobile: "h-12 rounded-xl px-6 text-base",
        mobileLg: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10",
        iconLg: "h-12 w-12",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
