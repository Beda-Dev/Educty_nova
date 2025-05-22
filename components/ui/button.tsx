import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0   disabled:opacity-50  whitespace-nowrap disabled:pointer-events-none",
  {
    variants: {
      color: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        primary: "bg-primary text-primary-foreground hover:bg-primary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "bg-success text-success-foreground hover:bg-success/80",
        info: "bg-info text-info-foreground hover:bg-info/80",
        warning: "bg-warning text-warning-foreground hover:bg-warning/80",
        secondary:
          "bg-secondary text-muted-foreground dark:text-default-950 hover:bg-secondary/80",
        dark: "bg-accent-foreground text-accent hover:bg-accent-foreground/80",
        tyrian: "bg-tyrian text-tyrian-foreground hover:bg-tyrian/80",
        bittersweet:
          "bg-bittersweet text-bittersweet-foreground hover:bg-bittersweet/80",
        whitesmoke:
          "bg-whitesmoke text-whitesmoke-foreground hover:bg-whitesmoke/80",
        skyblue: "bg-skyblue text-skyblue-foreground hover:bg-skyblue/80",
        indigodye:
          "bg-indigodye text-indigodye-foreground hover:bg-indigodye/80",
      },
      variant: {
        outline:
          "border border-current  bg-transparent hover:text-primary-foreground",
        soft: " bg-opacity-10  hover:text-primary-foreground",
        ghost: "bg-transparent text-current hover:text-primary-foreground",
      },
      size: {
        default: "h-10 px-4 py-[10px]",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-[18px] py-[10px] text-base",
        xl: "h-12 rounded-md px-6 py-3 text-base",
        md: "h-9 rounded-md px-4 py-2",
        xs: "h-9 rounded-md px-[14px] py-[6px]",
        icon: "h-10 w-10",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "destructive",
        className:
          "text-destructive hover:text-destructive-foreground hover:border-destructive hover:bg-destructive",
      },
      {
        variant: "outline",
        color: "success",
        className:
          "text-success hover:text-success-foreground hover:border-success hover:bg-success",
      },
      {
        variant: "outline",
        color: "info",
        className:
          "text-info hover:text-info-foreground hover:border-info hover:bg-info",
      },
      {
        variant: "outline",
        color: "warning",
        className:
          "text-warning hover:text-warning-foreground hover:border-warning hover:bg-warning",
      },
      {
        variant: "outline",
        color: "dark",
        className: "text-accent-foreground hover:bg-accent-foreground",
      },
      {
        variant: "outline",
        color: "secondary",
        className:
          "text-muted-foreground dark:bg-transparent hover:bg-default-500  dark:hover:bg-default-500/50 border-default-500",
      },
      {
        variant: "outline",
        color: "default",
        className:
          "text-primary  hover:text-primary-foreground hover:border-primary hover:bg-primary",
      },
      {
        variant: "outline",
        color: "primary",
        className: "text-primary  hover:text-primary-foreground",
      },
      {
        variant: "soft",
        color: "info",
        className: "text-info hover:text-info-foreground",
      },
      {
        variant: "soft",
        color: "warning",
        className: "text-warning hover:text-warning-foreground",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "text-destructive  hover:text-destructive-foreground",
      },
      {
        variant: "soft",
        color: "success",
        className: "text-success hover:text-success-foreground",
      },
      {
        variant: "soft",
        color: "secondary",
        className:
          "text-muted-foreground dark:bg-opacity-50  hover:bg-default-500/50  dark:hover:bg-opacity-100",
      },
      {
        variant: "soft",
        color: "default",
        className: "text-primary",
      },
      {
        variant: "ghost",
        color: "default",
        className: " text-primary  ",
      },
      {
        variant: "ghost",
        color: "secondary",
        className:
          " text-muted-foreground dark:bg-transparent hover:bg-default-500/50  dark:hover:bg-default-500/50",
      },
      {
        variant: "ghost",
        color: "success",
        className: " text-success  hover:text-success-foreground ",
      },
      {
        variant: "ghost",
        color: "info",
        className: " text-info hover:text-info-foreground ",
      },
      {
        variant: "ghost",
        color: "warning",
        className: " text-warning hover:text-warning-foreground ",
      },
      {
        variant: "ghost",
        color: "destructive",
        className: " text-destructive  hover:text-destructive-foreground ",
      },
      // Tyrian
      {
        variant: "outline",
        color: "tyrian",
        className:
          "text-tyrian hover:text-tyrian-foreground hover:border-tyrian hover:bg-tyrian",
      },
      {
        variant: "soft",
        color: "tyrian",
        className: "bg-tyrian/10 text-tyrian hover:bg-tyrian/20",
      },
      {
        variant: "ghost",
        color: "tyrian",
        className: "text-tyrian hover:bg-tyrian/10 hover:text-muted-foreground",
      },

      // Bittersweet
      {
        variant: "outline",
        color: "bittersweet",
        className:
          "text-bittersweet hover:text-bittersweet-foreground hover:border-bittersweet hover:bg-bittersweet",
      },
      {
        variant: "soft",
        color: "bittersweet",
        className: "bg-bittersweet/10 text-bittersweet hover:bg-bittersweet/20",
      },
      {
        variant: "ghost",
        color: "bittersweet",
        className: "text-bittersweet hover:bg-bittersweet/10 hover:text-muted-foreground",
      },

      // White Smoke
      {
        variant: "outline",
        color: "whitesmoke",
        className:
          "text-whitesmoke hover:text-whitesmoke-foreground hover:border-whitesmoke hover:bg-whitesmoke",
      },
      {
        variant: "soft",
        color: "whitesmoke",
        className: "bg-whitesmoke/50 text-whitesmoke hover:bg-whitesmoke/70",
      },
      {
        variant: "ghost",
        color: "whitesmoke",
        className: "text-whitesmoke hover:bg-whitesmoke/20 hover:text-muted-foreground",
      },

      // Vivid Sky Blue
      {
        variant: "outline",
        color: "skyblue",
        className:
          "text-skyblue hover:text-skyblue-foreground hover:border-skyblue hover:bg-skyblue",
      },
      {
        variant: "soft",
        color: "skyblue",
        className: "bg-skyblue/10 text-skyblue hover:bg-skyblue/20",
      },
      {
        variant: "ghost",
        color: "skyblue",
        className: "text-skyblue hover:bg-skyblue/10 hover:text-muted-foreground",
      },

      // Indigo Dye
      {
        variant: "outline",
        color: "indigodye",
        className:
          "text-indigodye hover:text-indigodye-foreground hover:border-indigodye hover:bg-indigodye",
      },
      {
        variant: "soft",
        color: "indigodye",
        className: "bg-indigodye/10 text-indigodye hover:bg-indigodye/20 ",
      },
      {
        variant: "ghost",
        color: "indigodye",
        className: "text-indigodye hover:bg-indigodye/10  hover:text-muted-foreground",
      },
    ],

    defaultVariants: {
      color: "skyblue",
      size: "default",
    },
  }
);
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "destructive"
    | "default"
    | "dark"
    | "tyrian"
    | "bittersweet"
    | "whitesmoke"
    | "skyblue"
    | "indigodye";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, color, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, color, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
