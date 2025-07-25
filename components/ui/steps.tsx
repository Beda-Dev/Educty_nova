import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const stepVariants = cva(
  " flex   break-words [&_[step-box]]:font-medium  [&_[step-box=disable]]:text-foreground/70 [&_[step-box=completed]]:text-skyblue-foreground [&_[step-box=current]]:text-skyblue [&_[step-box=current]]:bg-background  ",
  {
    variants: {
      variant: {
        skyblue:
          "[&_[step-bar-bg=disable]]:before:bg-skyblue [&_[step-bar-bg=current]]:before:bg-skyblue [&_[step-bar-bg=completed]]:before:bg-skyblue [&_[step-box=current]]:border-2 [&_[step-box=current]]:border-skyblue [&_[step-box=completed]]:bg-skyblue   [&_[step-box=disable]]:bg-default-200 [&_[step-box=error]]:bg-destructive [&_[step-box=error]]:text-destructive-foreground  ",
      },
      size: {
        sm: "[&_[step-box]]:h-5 [&_[step-box]]:w-5 [&_[step-box]]:text-[10px]",
        md: "[&_[step-box]]:h-8 [&_[step-box]]:w-8 [&_[step-box]]:text-xs",
        lg: "[&_[step-box]]:h-9 [&_[step-box]]:w-9 [&_[step-box]]:text-sm ",
        xl: "[&_[step-box]]:h-10 [&_[step-box]]:w-10 [&_[step-box]]:text-base",
      },
      content: {
        right: "flex-row",
        bottom: "flex-col",
      },
    },
    defaultVariants: {
      variant: "skyblue",
      size: "lg",
      content: "bottom",
    },
  }
);
const stepperVariants = cva("flex ", {
  variants: {
    direction: {
      horizontal: "flex-row items-center",
      vertical: "flex-col ltr:items-baseline",
    },
  },

  defaultVariants: {
    direction: "horizontal",
  },
});


interface StepperProps extends React.HTMLAttributes<HTMLOListElement>,
  VariantProps<typeof stepVariants> {
  children?: React.ReactNode;
  activestep?: number;
  disabled?: boolean;
  direction: "horizontal" | "vertical";
  current?: number;
  content?: "bottom" | "right";
  icon?: boolean;
  alternativeLabel?: boolean;
  gap?: boolean;
  status?: "error" | "warning" | "success" | "info";


}
const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    {
      className,
      children,
      activestep,
      direction,
      disabled,
      variant,
      size,
      current,
      content,
      icon,
      alternativeLabel,
      gap,
      status,
      ...props
    },
    ref
  ) => {
    const childItem = React.Children.toArray(children);
    return (
      <ol
        ref={ref}
        className={cn(stepperVariants({ direction }), className, {
          "gap-2": gap,
          " text-center": alternativeLabel,
          "gap-3": content === "right",
        })}
        {...props}
      >
        {childItem.map((child, index) => {
          const isLast = index === childItem.length - 1;
          const isBeforeLast = index === childItem.length - 2;
          const count = index + 1;
          return React.cloneElement(child as React.ReactElement, {
            ...props,
            isLast,
            activestep: activestep,
            disabled: disabled && !isLast,
            count,
            index: index,
            current: current,
            //...child.props ,
            gap: gap,
            direction: direction,
            alternativeLabel: alternativeLabel,
            isBeforeLast: isBeforeLast,
            content: content,
            status: status,
            size: size,
            className: cn(
              stepVariants({ variant, size, content }),

            ),
          });
        })}
      </ol>
    );
  }
);
Stepper.displayName = "Stepper";

interface StepProps extends React.HTMLAttributes<HTMLLIElement>,
  VariantProps<typeof stepVariants> {
  children?: React.ReactNode;

  isLast?: boolean;
  count?: number;
  current?: number;
  index?: number;
  icon?: boolean | React.ReactNode;
  gap?: boolean;
  direction?: "horizontal" | "vertical";
  alternativeLabel?: boolean;
  isBeforeLast?: boolean;
  status?: "error" | "warning" | "success" | "info";
  content?: "bottom" | "right";


}
const Step = React.forwardRef<HTMLLIElement, StepProps>(
  (
    {
      className,
      children,
      variant,
      size,
      isLast,
      count,
      current,
      content,
      index,
      icon,
      gap,
      direction,
      alternativeLabel,
      isBeforeLast,
      status,
      ...props
    },
    ref
  ) => {
    const getStepBarBg = (current: any, index: any) => {
      if (current > index) return "completed";
      if (current < index) return "disable";
      if (current === index) return "current";
      return "";
    };

    const stepBarBg = getStepBarBg(current, index);

    const getStepBox = (current: any, index: any, status: any) => {
      if (status === "error" && current === index) {
        return "error";
      }
      if (current > index) return "completed";
      if (current < index) return "disable";
      if (current === index) return "current";
      return "";
    };

    const stepBox = getStepBox(current, index, status);
    // Check if content is 'right'
    const isContentRight = content === "right";
    // Check if any of the specific props are present
    const hasSpecificProps =
      gap !== undefined ||
      alternativeLabel !== undefined ||
      direction !== undefined;
    // has render
    const renderChildren =
      !isContentRight || (isContentRight && !hasSpecificProps);
    return (
      <li
        ref={ref}
        className={cn(stepVariants({ variant, size, content }), className, {
          "flex-row gap-x-4 min-h-[80px]": direction === "vertical",
          "flex-1": !isLast,
          "last:flex-1": alternativeLabel && isLast,
          "last:flex-none": alternativeLabel && isLast && gap,
        })}
        {...props}
      >
        <div
          step-bar-bg={stepBarBg}
          className={cn("flex items-center flex-row relative z-[1] ", {
            "flex-col  ": direction === "vertical",

            " before:absolute  before:z-[-1]   before:top-1/2 before:-translate-y-1/2 before:w-full ":
              !isLast && direction !== "vertical",
            "ltr:before:left-[44px] before:w-[calc(100%-44px)] rtl:before:right-[44px]":
              gap && !alternativeLabel,
            "ltr:before:left-1/2 rtl:before:right-1/2 ": alternativeLabel && !gap,
            "ltr:before:left-[calc(50%+33px)] rtl:before:right-[calc(50%+33px)] before:w-[calc(100%-60px)]":
              alternativeLabel && gap,
            "before:w-[calc(100%-85px)]":
              alternativeLabel && gap && isBeforeLast,
            "flex-1 before:h-0.5  ": isContentRight,
            "before:h-1": !isContentRight,
          })}
        >
          <span
            className={cn(
              "flex-none   inline-flex items-center justify-center rounded-full relative z-20 leading-none ",
              {
                "mx-auto": alternativeLabel,
                "[&>svg]:w-5 [&>svg]:h-5": size !== "sm",
                "[&>svg]:w-3 [&>svg]:h-3": size === "sm",
              }
            )}
            step-box={stepBox}
          >
            {stepBarBg === "completed" ? <Check /> : icon ? icon : count}
          </span>
          {isContentRight && renderChildren && (
            <div className=" bg-card px-3">{children}</div>
          )}

          {!isLast && direction === "vertical" && (
            <div
              className={cn(
                "h-full w-1 grow  before:absolute before:h-full  before:w-full relative",
                {
                  "before:top-[10px] before:h-[calc(100%-10px)] ": gap,
                }
              )}
              step-bar-bg={stepBarBg}
            />
          )}
        </div>
        {!isContentRight && renderChildren && <div>{children}</div>}
      </li>
    );
  }
);
Step.displayName = "Step";


interface CommonProps {
  error?: boolean
  icon?: React.ReactNode
  completed?: boolean
  active?: boolean
  className?: string
  children?: React.ReactNode; // Added children prop
}

const StepLabel = React.forwardRef<HTMLDivElement, CommonProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, error, icon, completed, active, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-sm text-skyblue  font-medium mt-2",
          {
            "text-destructive": error,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StepLabel.displayName = "StepLabel";

const StepDescription = React.forwardRef<HTMLDivElement, CommonProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "text-sm  text-muted-foreground",
          {
            "text-destructive": error,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StepDescription.displayName = "StepDescription";

export { Stepper, Step, StepLabel, StepDescription };
