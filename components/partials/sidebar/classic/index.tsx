"use client"
import React, { useState } from "react"
import { cn, isLocationMatch, getDynamicPath } from "@/lib/utils"
import { useSidebar, useThemeStore } from "@/store"
import SidebarLogo from "../common/logo"
import { menusConfig, filterMenuItems } from "@/config/menus"
import MenuLabel from "../common/menu-label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import SingleMenuItem from "./single-menu-item"
import SubMenuHandler from "./sub-menu-handler"
import NestedSubMenu from "../common/nested-menus"
import { useSchoolStore } from "@/store"
import { MenuItemProps } from "@/config/menus"  

const ClassicSidebar = ({ trans }: { trans: string }) => {
  const { sidebarBg } = useSidebar()
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null)
  const [activeMultiMenu, setMultiMenu] = useState<number | null>(null)

  // Récupération des données utilisateur et professeurs depuis le store
  const { userOnline, professor } = useSchoolStore()

  // Filtrage des menus selon les permissions et le rôle de l'utilisateur
  const menus = filterMenuItems(menusConfig?.sidebarNav?.classic as MenuItemProps[] || [], userOnline, professor || []) 
  const { collapsed, setCollapsed } = useSidebar()
  const { isRtl } = useThemeStore()
  const [hovered, setHovered] = useState<boolean>(false)

  const toggleSubmenu = (i: number) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null)
    } else {
      setActiveSubmenu(i)
    }
  }

  const toggleMultiMenu = (subIndex: number) => {
    if (activeMultiMenu === subIndex) {
      setMultiMenu(null)
    } else {
      setMultiMenu(subIndex)
    }
  }

  const pathname = usePathname()
  const locationName = getDynamicPath(pathname)

  // Function to check if a menu item is active
  const isActiveMenu = (href: string) => {
    return isLocationMatch(href, locationName)
  }

  React.useEffect(() => {
    let subMenuIndex = null
    let multiMenuIndex = null
    menus?.map((item: MenuItemProps, i: number) => {
      if (item?.child) {
        item.child.map((childItem: MenuItemProps, j: number) => {
          if (isLocationMatch(childItem.href, locationName)) {
            subMenuIndex = i
          }
          if (childItem?.multi_menu) {
            childItem.multi_menu.map((multiItem: MenuItemProps, k: number) => {
              if (isLocationMatch(multiItem.href, locationName)) {
                subMenuIndex = i
                multiMenuIndex = j
              }
            })
          }
        })
      }
    })
    setActiveSubmenu(subMenuIndex)
    setMultiMenu(multiMenuIndex)
  }, [locationName, menus])

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("fixed  z-[999] top-0  bg-card h-full hover:!w-[248px]  border-r  ", {
        "w-[248px]": !collapsed,
        "w-[72px]": collapsed,
        "shadow-md": collapsed || hovered,
      })}
    >
      {sidebarBg !== "none" && (
        <div
          className=" absolute left-0 top-0   z-[-1] w-full h-full bg-cover bg-center opacity-[0.07]"
          style={{ backgroundImage: `url(${sidebarBg})` }}
        ></div>
      )}

      <SidebarLogo hovered={hovered} />

      <ScrollArea
        className={cn("sidebar-menu  h-[calc(100%-80px)] ", {
          "px-4": !collapsed || hovered,
        })}
      >
        <ul
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(" space-y-1", {
            " space-y-2 text-center": collapsed,
            "text-start": collapsed && hovered,
          })}
        >
          {menus.map((item: MenuItemProps, i: number) => (
            <li key={`menu_key_${i}`}>
              {/* single menu  */}
              {item && !item.child && !item.isHeader && (
                <SingleMenuItem
                  item={item}
                  collapsed={collapsed}
                  hovered={hovered}
                  trans={trans}
                  isActive={isActiveMenu(item.href as string)}
                />
              )}

              {/* menu label */}
              {item && item.isHeader && !item.child && (!collapsed || hovered) && (
                <MenuLabel item={item} trans={trans} />
              )}

              {/* sub menu */}
              {item && item.child && (
                <>
                  <SubMenuHandler
                    item={item}
                    toggleSubmenu={toggleSubmenu}
                    index={i}
                    isActive={activeSubmenu === i}
                    collapsed={collapsed}
                    hovered={hovered}
                    trans={trans}
                  />

                  {(!collapsed || hovered) && (
                    <NestedSubMenu
                      toggleMultiMenu={toggleMultiMenu}
                      activeMultiMenu={activeMultiMenu}
                      activeSubmenu={activeSubmenu}
                      item={item}
                      index={i}
                      trans={trans}
                      title={item.title}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

export default ClassicSidebar
