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

type User = {
  id: number;
  hierarchical_id?: number;
  name: string;
  email: string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
};

type Expense = {
  id: number;
  expense_type_id: number;
  cash_register_id: number;
  label: string;
  amount: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
};

type Notification = {
  id: number;
  user_id: number;
  expense_id: number;
  validation_date: string;
  comment: string;
  validation_order: number;
  validation_status: string;
  created_at: string;
  updated_at: string;
  user?: User;
  expense?: Expense;
};

// Données fictives de notifications
const notifications: Notification[] = [
  {
    id: 1,
    user_id: 101,
    expense_id: 1001,
    validation_date: "2023-05-15T10:30:00Z",
    comment: "Dépense urgente pour fournitures de bureau",
    validation_order: 1,
    validation_status: "pending",
    created_at: "2023-05-15T09:15:00Z",
    updated_at: "2023-05-15T09:15:00Z",
    user: {
      id: 101,
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      email_verified_at: null,
      created_at: "2023-01-10T08:00:00Z",
      updated_at: "2023-01-10T08:00:00Z",
    },
    expense: {
      id: 1001,
      expense_type_id: 3,
      cash_register_id: 5,
      label: "Fournitures de bureau",
      amount: "245.50",
      expense_date: "2023-05-14",
      created_at: "2023-05-14T16:20:00Z",
      updated_at: "2023-05-14T16:20:00Z",
    },
  },
  {
    id: 2,
    user_id: 102,
    expense_id: 1002,
    validation_date: "2023-05-14T16:45:00Z",
    comment: "Frais de déplacement client important",
    validation_order: 2,
    validation_status: "pending",
    created_at: "2023-05-14T15:30:00Z",
    updated_at: "2023-05-14T15:30:00Z",
    user: {
      id: 102,
      name: "Marie Lambert",
      email: "marie.lambert@example.com",
      email_verified_at: null,
      created_at: "2023-02-15T09:00:00Z",
      updated_at: "2023-02-15T09:00:00Z",
    },
    expense: {
      id: 1002,
      expense_type_id: 2,
      cash_register_id: 5,
      label: "Déplacement client XYZ",
      amount: "320.75",
      expense_date: "2023-05-12",
      created_at: "2023-05-12T18:10:00Z",
      updated_at: "2023-05-12T18:10:00Z",
    },
  },
  {
    id: 3,
    user_id: 103,
    expense_id: 1003,
    validation_date: "2023-05-13T11:20:00Z",
    comment: "Abonnement logiciel mensuel",
    validation_order: 3,
    validation_status: "pending",
    created_at: "2023-05-13T10:05:00Z",
    updated_at: "2023-05-13T10:05:00Z",
    user: {
      id: 103,
      name: "Pierre Martin",
      email: "pierre.martin@example.com",
      email_verified_at: null,
      created_at: "2023-03-20T14:00:00Z",
      updated_at: "2023-03-20T14:00:00Z",
    },
    expense: {
      id: 1003,
      expense_type_id: 4,
      cash_register_id: 5,
      label: "Abonnement Logiciel Pro",
      amount: "59.99",
      expense_date: "2023-05-10",
      created_at: "2023-05-10T12:00:00Z",
      updated_at: "2023-05-10T12:00:00Z",
    },
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const NotificationMessage = () => {
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
            {notifications.length}
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
          <span className="text-xs font-medium text-white flex-0 cursor-pointer hover:underline hover:decoration-default-100 dark:decoration-default-900">
            Tout marquer comme lu
          </span>
        </DropdownMenuLabel>
        <div className="h-[300px] xl:h-[350px]">
          <ScrollArea className="h-full">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={`notification-${notification.id}`}
                className="flex gap-4 py-3 px-4 cursor-pointer dark:hover:bg-background"
              >
                <div className="flex-1 flex items-start gap-3">
                  <Avatar className="h-10 w-10 rounded">
                    <AvatarFallback>
                      {notification.user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-default-900 mb-1">
                      {notification.user?.name} - {notification.expense?.label}
                    </div>
                    <div className="text-xs text-default-600 mb-1">
                      Montant: {notification.expense?.amount} €
                    </div>
                    <div className="text-xs text-default-900">
                      {notification.comment}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={cn(
                      "text-xs font-medium text-default-900 whitespace-nowrap mb-1",
                      {
                        "text-default-600":
                          notification.validation_status !== "pending",
                      }
                    )}
                  >
                    {formatDate(notification.validation_date)}
                  </div>
                  <div
                    className={cn("w-2 h-2 rounded-full", {
                      "bg-primary": notification.validation_status === "pending",
                      "bg-gray-400": notification.validation_status !== "pending",
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
            <Link href="/expenses/validation">Voir toutes les validations</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;