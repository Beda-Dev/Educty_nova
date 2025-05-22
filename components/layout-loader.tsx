"use client";
import React from "react";
import LogoComponent1 from "@/app/[lang]/logo1";
import { Loader2 } from "lucide-react";
const LayoutLoader = () => {
  return (
    <div className=" h-screen flex items-center justify-center flex-col space-y-2">
      <LogoComponent1 width={40} height={40} />
      <span className=" inline-flex gap-1">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement...
      </span>
    </div>
  );
};

export default LayoutLoader;
