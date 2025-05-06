"use client";
import { SiteLogo } from "@/components/svg";
import { Loader2 } from "lucide-react";
import { CircularProgress } from "@/components/ui/progress";

const Loading = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col space-y-2">
      <SiteLogo className="h-10 w-10 text-primary" />
      <span className="inline-flex gap-1 items-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Chargement...
      </span>
    </div>
  );
};

export default Loading;