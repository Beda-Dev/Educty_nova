"use client";
import React, { useEffect, useState } from "react";
import { cn, isLocationMatch } from "@/lib/utils";
import { useSidebar, useSchoolStore } from "@/store";
import SidebarLogo from "../common/logo";
import { menusConfig } from "@/config/menus";
import MenuLabel from "../common/menu-label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import SingleMenuItem from "./single-menu-item";
import SubMenuHandler from "./sub-menu-handler";
import NestedSubMenu from "../common/nested-menus";
import { verificationPermission } from "@/lib/fonction";

const hasAccess = (
  userPermissions: string[],
  userRoles: string[],
  item: any
): boolean => {
  const hasPermission =
    !item.requiredPermission ||
    verificationPermission({ permissionNames: userPermissions }, [
      item.requiredPermission,
    ]);

  const hasRole = !item.requiredRole || userRoles.includes(item.requiredRole);

  return hasPermission && hasRole && !item.hideIf;
};

const filterItems = (
  items: any[],
  userPermissions: string[],
  userRoles: string[]
): any[] => {
  return items
    .filter((item) => hasAccess(userPermissions, userRoles, item))
    .map((item) => ({
      ...item,
      child: item.child
        ? filterItems(item.child, userPermissions, userRoles)
        : undefined,
    }))
    .filter((item) => !item.child || item.child.length > 0);
};

interface MobileSidebarProps {
  className?: string;
  trans: any;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ className, trans }) => {
  const { sidebarBg, mobileMenu, setMobileMenu, collapsed } = useSidebar();
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [activeMultiMenu, setMultiMenu] = useState<number | null>(null);
  const { userOnline } = useSchoolStore();
  
  // Récupérer les menus avec filtrage des permissions
  const allMenus = menusConfig?.sidebarNav?.classic || [];
  const filteredMenus = filterItems(
    allMenus,
    userOnline?.permissionNames || [],
    userOnline?.roles?.map((r: any) => r.name) || []
  ) as any[];

  const toggleSubmenu = (i: number) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const toggleMultiMenu = (subIndex: number) => {
    if (activeMultiMenu === subIndex) {
      setMultiMenu(null);
    } else {
      setMultiMenu(subIndex);
    }
  };
  const locationName = usePathname();

  useEffect(() => {
    let subMenuIndex = null;
    let multiMenuIndex = null;
    filteredMenus?.map((item: any, i: number) => {
      if (item?.child) {
        item.child.map((childItem: any, j: number) => {
          if (isLocationMatch(childItem.href, locationName)) {
            subMenuIndex = i;
          }
          if (childItem?.multi_menu) {
            childItem.multi_menu.map((multiItem: any, k: number) => {
              if (isLocationMatch(multiItem.href, locationName)) {
                subMenuIndex = i;
                multiMenuIndex = j;
              }
            });
          }
        });
      }
    });
    setActiveSubmenu(subMenuIndex);
    setMultiMenu(multiMenuIndex);
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [locationName, mobileMenu, setMobileMenu]);
  return (
    <>
      <div
        className={cn(
          "fixed top-0  bg-card h-full w-[248px] z-[9999] ",
          className,
          {
            " -left-[300px] invisible opacity-0  ": !mobileMenu,
            " left-0 visible opacity-100  ": mobileMenu,
          }
        )}
      >
        {sidebarBg !== "none" && (
          <div
            className=" absolute left-0 top-0   z-[-1] w-full h-full bg-cover bg-center opacity-[0.07]"
            style={{ backgroundImage: `url(${sidebarBg})` }}
          ></div>
        )}
        <SidebarLogo hovered={collapsed} />
        <ScrollArea
          className={cn("sidebar-menu  h-[calc(100%-80px)] ", {
            "px-4": !collapsed,
          })}
        >
          <ul
            className={cn("", {
              " space-y-2 text-center": collapsed,
            })}
          >
            {filteredMenus.map((item, i) => (
              <li key={`menu_key_${i}`}>
                {/* single menu  */}
                {!item.child && !item.isHeader && (
                  <SingleMenuItem item={item} collapsed={collapsed} trans={trans} />
                )}

                {/* menu label */}
                {item.isHeader && !item.child && !collapsed && (
                  <MenuLabel item={item} trans={trans} />
                )}

                {/* sub menu */}
                {item.child && (
                  <>
                    <SubMenuHandler
                      item={item}
                      toggleSubmenu={toggleSubmenu}
                      index={i}
                      activeSubmenu={activeSubmenu}
                      collapsed={collapsed}
                      trans={trans}
                    />

                    {!collapsed && (
                      <NestedSubMenu
                        toggleMultiMenu={toggleMultiMenu}
                        activeMultiMenu={activeMultiMenu}
                        activeSubmenu={activeSubmenu}
                        item={item}
                        index={i} title={""} trans={trans} />
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          className="overlay bg-black/60 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]"
        ></div>
      )}
    </>
  );
};

export default MobileSidebar;
