"use client";
import React from "react";
import { cn } from "@/lib/utils";
import DynamicMenu from "./new_menu"

const ClassicHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <header className={cn("z-50", className)}>{children}<DynamicMenu /></header>;
};

export default ClassicHeader;
