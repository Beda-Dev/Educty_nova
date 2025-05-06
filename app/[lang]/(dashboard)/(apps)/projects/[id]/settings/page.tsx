"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import projectLogo from "@/public/images/projects/project-placeholder.jpg";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const Settings = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Card>
      <CardHeader className="border-none mb-3 px-7 pt-7">
        <CardTitle>Project Settings</CardTitle>
      </CardHeader>
      <CardContent className="px-7 mt-5 space-y-6">
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-3">
            <div className="text-sm font-medium text-default-700">Project Logo</div>
          </div>
          <div className="col-span-12 md:col-span-9">
            <div className="w-28 h-28 shadow-sm rounded-md relative">
              <Image src={projectLogo} className="w-full h-full object-cover rounded-md" alt="Project Logo" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="changeProjectLogo" className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-primary-foreground rounded-full grid place-content-center">
                      <>
                        <Pencil className="w-3 h-3" />
                        <Input type="file" id="changeProjectLogo" className="hidden" />
                      </>
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change Avatar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mt-2 text-sm font-medium text-default-500">Allowed file types: png, jpg, jpeg.</div>
          </div>
        </div>
        
        {/* Due Date */}
        <div className="grid grid-cols-12 items-center gap-5">
          <div className="col-span-12 md:col-span-3">
            <div className="text-sm font-medium text-default-700">Due Date</div>
          </div>
          <div className="col-span-12 md:col-span-9">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;