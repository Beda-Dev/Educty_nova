import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-[2px] text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      color: {
        default: "border-transparent bg-primary text-primary-foreground ",
        destructive:
          "bg-destructive border-transparent text-destructive-foreground",
        success: "bg-success border-transparent  text-success-foreground ",
        info: "bg-info border-transparent text-info-foreground ",
        warning: "bg-warning  border-transparent text-warning-foreground",
        secondary: "bg-secondary border-transparent text-foreground ",
        dark: "bg-accent-foreground border-transparent text-accent ",
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
        outline: "border border-current bg-background  ",
        soft: "text-current bg-opacity-10  hover:text-primary-foreground",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "destructive",
        className: "text-destructive",
      },
      {
        variant: "outline",
        color: "success",
        className: "text-success",
      },
      {
        variant: "outline",
        color: "info",
        className: "text-info",
      },
      {
        variant: "outline",
        color: "warning",
        className: "text-warning",
      },
      {
        variant: "outline",
        color: "dark",
        className: "text-accent-foreground",
      },
      {
        variant: "outline",
        color: "secondary",
        className:
          "text-muted-foreground dark:bg-transparent border-default-500",
      },
      {
        variant: "outline",
        color: "default",
        className: "text-primary",
      },
      // soft button variant
      {
        variant: "soft",
        color: "default",
        className: "text-primary hover:text-primary",
      },
      {
        variant: "soft",
        color: "info",
        className: "text-info hover:text-info",
      },
      {
        variant: "soft",
        color: "warning",
        className: "text-warning hover:text-warning",
      },
      {
        variant: "soft",
        color: "destructive",
        className: "text-destructive hover:text-destructive",
      },
      {
        variant: "soft",
        color: "success",
        className: "text-success hover:text-success",
      },
      {
        variant: "soft",
        color: "secondary",
        className:
          "text-muted-foreground hover:text-muted-foreground !bg-opacity-50 ",
      },
      {
        variant: "soft",
        color: "default",
        className: "text-primary hover:text-primary",
      },
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
      }
    ],
    defaultVariants: {
      color: "skyblue",
    },
  }
);
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  variant?: "outline" | "soft";
  color?: "default" | "destructive" | "success" | "info" | "warning" | "dark" | "secondary" | "tyrian" | "bittersweet" | "whitesmoke" | "skyblue" | "indigodye";
}


function Badge({ className, color, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ color, variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
