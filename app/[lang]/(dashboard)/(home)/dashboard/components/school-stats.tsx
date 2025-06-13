"use client"

import { UserFemale, NoteIcon, CheckShape, Spam , UserGroup , UserMale , Class} from "@/components/svg";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { User, Classe, Registration } from "@/lib/interface";

interface StatsProps {
  registrations: Registration[];
  classes: Classe[];
  users: User[];
}

const SchoolStats = ({ registrations, classes, users }: StatsProps) => {
  const totalStudents = registrations.length;
  const totalClasses = classes.length;
  const totalUsers = users.length;

  const acceptedFemales = ["f", "féminin", "feminin"];
  const femaleStudents = registrations.filter(reg => 
    acceptedFemales.includes(reg.student?.sexe?.toLowerCase())
  ).length;
  
  const maleStudents = totalStudents - femaleStudents;

  const data = [
    {
      text: "Élèves inscrits",
      total: totalStudents.toString(),
      color: "skyblue",
      icon: <UserGroup className="w-3.5 h-3.5" />
    },
    {
      text: "Filles",
      total: femaleStudents.toString(),
      color: "warning",
      icon: <UserFemale className="w-4.5 h-4.5" />
    },
    {
      text: "Garçons",
      total: maleStudents.toString(),
      color: "success",
      icon: <UserMale className="w-4.5 h-4.5" />
    },
    {
      text: "Classes",
      total: totalClasses.toString(),
      color: "destructive",
      icon: <Class className="w-3.5 h-3.5" />
    },
  ];
  return (
    <>
      {data.map((item, index) => (
        <div
          key={`reports-state-${index}`}
          className={cn(
            "flex flex-col gap-1.5 p-2 rounded-l overflow-hidden bg-skyblue/10  items-start relative before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-1 before:h-[1px] before:w-8 before:bg-primary/50 dark:before:bg-primary-foreground before:hidden ",
            {
              "bg-skyblue/40  dark:bg-skyblue/70": item.color === "skyblue",
              "bg-orange-50 dark:bg-orange-500": item.color === "warning",
              "bg-green-50 dark:bg-green-500": item.color === "success",
              "bg-red-50 dark:bg-red-500 ": item.color === "destructive",
            }
          )}
        >
          <span
            className={cn(
              "h-[95px] w-[95px] rounded-full bg-primary/40 absolute -top-8 -right-8 ring-[20px] ring-primary/30",
              {
                "bg-skyblue/50  ring-skyblue/20 dark:bg-skyblue dark:ring-skyblue/40": item.color === "skyblue",
                "bg-orange-200 ring-orange-100 dark:bg-orange-300 dark:ring-orange-400": item.color === "warning",
                "bg-green-200 ring-green-100 dark:bg-green-300 dark:ring-green-400": item.color === "success",
                "bg-red-200 ring-red-100 dark:bg-red-300 dark:ring-red-400": item.color === "destructive",
              }
            )}
          ></span>
          <div className={`w-10 h-10 grid place-content-center rounded-full border border-dashed border-${item.color} dark:border-primary-foreground/60`}>
            <span className={cn(`h-8 w-8 rounded-full grid place-content-center  bg-${item.color}`, {
              "dark:bg-[#EFF3FF]/30": item.color === "skyblue",
              "dark:bg-[#FFF7ED]/30": item.color === "warning",
              "dark:bg-[#ECFDF4]/30": item.color === "success",
              "dark:bg-[#FEF2F2]/30": item.color === "destructive"
            })}>
              {item.icon}
            </span>
          </div>
          <span className="mt-3 text-lg text-default-800 dark:text-skyblue-foreground font-medium capitalize relative z-10">
            {item.text}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold text-default-900  dark:text-skyblue-foreground">{item.total}</span>
            <Icon icon="heroicons:arrow-trending-up" className={`w-5 h-5 text-${item.color} dark:text-skyblue-foreground`} />
          </div>
        </div>
      ))}
    </>
  );
};

export default SchoolStats;