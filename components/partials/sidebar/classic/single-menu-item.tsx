import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn, translate } from "@/lib/utils";
import Link from "next/link";

interface SingleMenuItemProps {
  item: any;
  collapsed: boolean;
  hovered: boolean;
  trans: any;
  isActive: boolean;
}

const SingleMenuItem: React.FC<SingleMenuItemProps> = ({ 
  item, 
  collapsed, 
  hovered, 
  trans, 
  isActive 
}) => {
  const { badge, href, title } = item;

  return (
    <Link href={href}>
      <>
        {!collapsed || hovered ? (
          <div
            className={cn(
              "flex  gap-3 group  text-default-700 dark:text-default-950  font-medium  text-sm capitalize px-[10px] py-3 rounded cursor-pointer hover:bg-skyblue hover:text-skyblue-foreground",
              {
                "bg-skyblue   text-skyblue-foreground ": isActive,
              }
            )}
          >
            <span className="flex-grow-0">
              <item.icon className="w-5 h-5  " />
            </span>
            <div className="text-box flex-grow">{translate(title, trans)}</div>
            {badge && <Badge className=" rounded">{item.badge}</Badge>}
          </div>
        ) : (
          <div>
            <span
              className={cn(
                "h-12 w-12 mx-auto rounded-md  transition-all duration-300 inline-flex flex-col items-center justify-center  relative  ",
                {
                  "bg-skyblue  text-skyblue-foreground ": isActive,
                  " text-default-600   ": !isActive,
                }
              )}
            >
              <item.icon className="w-6 h-6" />
            </span>
          </div>
        )}
      </>
    </Link>
  );
};

export default SingleMenuItem;
