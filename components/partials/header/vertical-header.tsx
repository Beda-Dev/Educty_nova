import React from "react";
import { useSidebar, useThemeStore } from "@/store";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import LogoComponent1 from "@/app/[lang]/logo1";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const MenuBar = ({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (value: boolean) => void }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 p-0 hover:bg-muted"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          >
            <div className="flex flex-col justify-between w-5 h-4">
              <span
                className={cn(
                  "block h-0.5 w-full bg-foreground transition-all duration-300",
                  collapsed ? "rotate-45 translate-y-[7px]" : ""
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-full bg-foreground transition-all duration-300",
                  collapsed ? "opacity-0" : "opacity-100"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-full bg-foreground transition-all duration-300",
                  collapsed ? "-rotate-45 -translate-y-[7px]" : ""
                )}
              />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {collapsed ? "Développer le menu" : "Réduire le menu"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

type VerticalHeaderProps = {
  handleOpenSearch: () => void;
};

const VerticalHeader: React.FC<VerticalHeaderProps> = ({ handleOpenSearch }) => {
  const { collapsed, setCollapsed, subMenu, sidebarType } = useSidebar();
  const { layout } = useThemeStore();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  const isMobile = !isTablet;

  const renderLogo = () => (
    <Link href="/dashboard" className="flex items-center">
      <LogoComponent1 width={28} height={28} className="text-primary" />
    </Link>
  );

  const renderSearchButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
            onClick={handleOpenSearch}
          >
            <Search className="h-4 w-4 md:mr-2" />
            {isTablet && (
              <span className="hidden md:inline-flex">Recherche...</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Rechercher dans l'application</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const shouldShowLogo = () => {
    if (layout === "semibox" && !isDesktop) return true;
    if (layout === "vertical" && !isDesktop && sidebarType !== "module") return true;
    if (layout === "vertical" && !isDesktop && isTablet && sidebarType === "module") return true;
    return false;
  };

  const shouldShowMenuBar = () => {
    if (isDesktop && sidebarType !== "module") return true;
    if (sidebarType === "module") return true;
    return false;
  };

  const shouldShowSearchButton = () => {
    if (sidebarType === "module" && isTablet) return true;
    if (sidebarType === "classic" || sidebarType === "popover") return true;
    return false;
  };

  return (
    <div className="flex items-center justify-between md:justify-start md:gap-4 gap-2 px-2 py-3">
      <div className="flex items-center gap-2">
        {shouldShowLogo() && renderLogo()}
        {shouldShowMenuBar() && (
          <MenuBar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
      </div>
      
      {shouldShowSearchButton() && renderSearchButton()}

      {/* Mobile menu button - only shown on mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex flex-col justify-between w-5 h-4">
            <span className="block h-0.5 w-full bg-foreground" />
            <span className="block h-0.5 w-full bg-foreground" />
            <span className="block h-0.5 w-full bg-foreground" />
          </div>
        </Button>
      )}
    </div>
  );
};

export default VerticalHeader;