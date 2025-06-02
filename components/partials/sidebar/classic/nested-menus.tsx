"use client";

import React from "react";
import { cn, translate } from "@/lib/utils";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface NestedSubMenuProps {
  toggleMultiMenu: (index: number) => void;
  activeMultiMenu: number | null;
  activeSubmenu: number | null;
  item: any;
  index: number;
  trans: any;
  isActive: boolean;
  title?: string;
}

const NestedSubMenu: React.FC<NestedSubMenuProps> = ({
  toggleMultiMenu,
  activeMultiMenu,
  activeSubmenu,
  item,
  index,
  trans,
  isActive,
}) => {
  const { child, multi_menu } = item;

  return (
    <div
      className={cn(
        "pl-10",
        {
          "block": activeSubmenu === index,
          "hidden": activeSubmenu !== index,
        }
      )}
    >
      <ul className="space-y-1">
        {child?.map((subItem: any, j: number) => (
          <li key={`submenu_${j}`}>
            <Link href={subItem.href}>
              <div
                className={cn(
                  "flex items-center gap-3 text-default-700 dark:text-default-950  font-medium text-sm capitalize px-[10px] py-3 rounded cursor-pointer hover:bg-skyblue hover:text-primary-foreground",
                  {
                    "bg-skyblue text-primary-foreground ": isActive,
                  }
                )}
              >
                <span className="flex-grow-0">
                  <subItem.icon className="w-5 h-5" />
                </span>
                <div className="text-box flex-grow">{translate(subItem.title, trans)}</div>
              </div>
            </Link>

            {subItem.multi_menu && (
              <ul className="pl-10">
                {subItem.multi_menu.map((multiItem: any, k: number) => (
                  <li key={`multimenu_${k}`}>
                    <Link href={multiItem.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 text-default-700 dark:text-default-950  font-medium text-sm capitalize px-[10px] py-3 rounded cursor-pointer hover:bg-skyblue hover:text-primary-foreground",
                          {
                            "bg-skyblue text-primary-foreground ": isActive,
                          }
                        )}
                      >
                        <span className="flex-grow-0">
                          <multiItem.icon className="w-5 h-5" />
                        </span>
                        <div className="text-box flex-grow">{translate(multiItem.title, trans)}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NestedSubMenu;
