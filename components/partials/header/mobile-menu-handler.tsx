"use client";
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/store";
import { cn } from "@/lib/utils";

const MobileMenuHandler = () => {
  const { mobileMenu, setMobileMenu } = useSidebar();
  
  return (
    <Button
      onClick={() => setMobileMenu(!mobileMenu)}
      variant="ghost"
      size="icon"
      className={cn(
        "relative h-10 w-10 rounded-full",
        "transition-all duration-200 ease-in-out",
        "hover:bg-primary/10 hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "dark:hover:bg-primary/20 dark:hover:text-primary",
        {
          "text-primary": mobileMenu,
          "text-muted-foreground": !mobileMenu
        }
      )}
      aria-label="Toggle menu"
      aria-expanded={mobileMenu}
    >
      <Menu className={cn(
        "h-5 w-5 transition-transform duration-200",
        {
          "rotate-90": mobileMenu
        }
      )} />
      
    </Button>
  );
};

export default MobileMenuHandler;