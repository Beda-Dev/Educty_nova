import { Bell } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import shortImage from "@/public/images/all-img/short-image-2.png";
import {AcademicYear , User} from "@/lib/interface"
import { useSchoolStore } from "@/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";



const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const NotificationMessage = () => {
  const { validationExpenses, setValidationExpenses } = useSchoolStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
          data-[state=open]:bg-default-100  dark:data-[state=open]:bg-default-200 
           hover:text-primary text-default-500 dark:text-default-800  rounded-full  "
        >
          <Bell className="h-5 w-5 " />
          <Badge className=" w-4 h-4 p-0 text-xs  font-medium  items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
            {validationExpenses.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className=" z-[999] mx-4 lg:w-[412px] p-0"
      >
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
        >
          <span className="text-base font-semibold text-white flex-1">
            Dépenses à valider
          </span>

        </DropdownMenuLabel>
        <div className="h-[300px] xl:h-[350px]">
          <ScrollArea className="h-full">
            {validationExpenses.map((validation) => (
              <DropdownMenuItem
                key={`notification-${validation.id}`}
                className="flex gap-4 py-3 px-4 cursor-pointer dark:hover:bg-background"
              >
                <div className="flex-1 flex items-start gap-3">
                  <Avatar className="h-10 w-10 rounded">
                    <AvatarFallback>
                      {validation.user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-default-900 mb-1">
                      {validation.user?.name} - {validation.expense?.label}
                    </div>
                    <div className="text-xs text-default-600 mb-1">
                      Montant: {validation.expense?.amount} Fcfa
                    </div>
                    <div className="text-xs text-default-900">
                      {validation.comment}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={cn(
                      "text-xs font-medium text-default-900 whitespace-nowrap mb-1",
                      {
                        "text-default-600":
                          validation.validation_status !== "pending",
                      }
                    )}
                  >
                    {formatDate(validation.validation_date)}
                  </div>
                  <div
                    className={cn("w-2 h-2 rounded-full", {
                      "bg-primary": validation.validation_status === "pending",
                      "bg-gray-400": validation.validation_status !== "pending",
                    })}
                  ></div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </div>
        <DropdownMenuSeparator />
        <div className="m-4 mt-5">
          <Button asChild className="w-full">
            <Link href="/decaissement/validation">Voir toutes les validations</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;